#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the area-directory master from e-Stat's public municipality CSV.

Usage:
  python3 scripts/generate-japan-municipalities.py --as-of 2026-11-23
  python3 scripts/generate-japan-municipalities.py --as-of 2026-11-23 --csv /path/to/export.csv

Only official names, readings and codes are retained. Numeric route identifiers
avoid guessing romanizations. This master describes administrative areas, not
telecommunications coverage. Raw source exports are not written to the repo.
"""
from argparse import ArgumentParser
from collections import Counter
from datetime import date
from io import StringIO
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import csv
import hashlib
import json
import re

BASE_URL = 'https://www.e-stat.go.jp/municipalities/cities/areacode'
SOUMU_SOURCE = 'https://www.soumu.go.jp/denshijiti/code.html'
NORTHERN_FOUR_ISLAND_CODES = {'01695', '01696', '01697', '01698', '01699', '01700'}


def download_url(as_of):
    params = [
        ('date_year', str(as_of.year)), ('date_month', str(as_of.month)),
        ('date_day', str(as_of.day)),
        *[(f'pf[{n}]', str(n)) for n in range(1, 48)],
        ('ht', ''), ('city_nm', ''),
        *[(f'city_kd[{n}]', str(n)) for n in (4, 5, 6, 7)],
        ('keyword_kd', 'code'),
        *[('item[]', item) for item in ('htCode', 'todoNm', 'parentCityNm', 'parentCityKana',
            'selfCityNm', 'selfCityKana', 'htCodeSDate', 'jiyuId')],
        ('sort[]', 'htCode-asc'),
        ('choices_to_show[]', 'cityType'), ('choices_to_sort[]', 'kasoFlg'),
        ('choices_to_sort_value[]', 'htCode-desc'),
        ('form_id', 'city_areacode_form'), ('source', 'setup'), ('page', ''),
        ('file_format', 'csv'), ('charset', 'UTF-8'), ('bom', '0'), ('op', 'download'),
    ]
    return BASE_URL + '?' + urlencode(params)


def normalize(raw, as_of, url):
    rows = list(csv.DictReader(StringIO(raw.decode('utf-8-sig'))))
    expected = {'標準地域コード', '都道府県', '政令市･郡･支庁･振興局等',
                '政令市･郡･支庁･振興局等（ふりがな）', '市区町村', '市区町村（ふりがな）'}
    if not rows or not expected.issubset(rows[0]):
        raise ValueError('The official export format changed; inspect the CSV before updating.')
    parents = {r['政令市･郡･支庁･振興局等']: r for r in rows if not r['市区町村']}
    if len(parents) != 20:
        raise ValueError('Designated-city grouping changed; inspect the official export.')
    prefectures = {}
    codes = set()
    excluded = []
    aggregate = []
    for r in rows:
        code = r['標準地域コード']
        if not re.fullmatch(r'\d{5}', code) or code in codes:
            raise ValueError('Invalid or repeated official municipality code: ' + code)
        codes.add(code)
        pref = prefectures.setdefault(code[:2], {'code': code[:2], 'name': r['都道府県'], 'municipalities': []})
        if pref['name'] != r['都道府県']:
            raise ValueError('Inconsistent prefecture name for code ' + code[:2])
        parent = r['政令市･郡･支庁･振興局等']
        parent_kana = r['政令市･郡･支庁･振興局等（ふりがな）']
        own = r['市区町村']
        own_kana = r['市区町村（ふりがな）']
        if code == '13100':
            aggregate.append({'code': code, 'name': own, 'reason': '東京都特別区部の集計行。23区それぞれを掲載するため、個別自治体として重複掲載しない。'})
            continue
        if not own:
            item = {'code': code, 'name': parent, 'kana': parent_kana, 'kind': 'designated-city'}
        elif parent in parents:
            item = {'code': code, 'name': parent + own, 'kana': parent_kana + own_kana,
                    'kind': 'designated-ward', 'parentCityName': parent,
                    'parentCityCode': parents[parent]['標準地域コード'], 'wardName': own}
        else:
            if own.endswith('市'):
                kind = 'city'
            elif own.endswith('町'):
                kind = 'town'
            elif own.endswith('村'):
                kind = 'village'
            elif code.startswith('131') and own.endswith('区'):
                kind = 'special-ward'
            else:
                raise ValueError('Unknown municipality type: ' + code + ':' + own)
            item = {'code': code, 'name': own, 'kana': own_kana, 'kind': kind}
            if parent:
                item['countyName' if parent.endswith('郡') else 'parentRegionName'] = parent
        if code == '39405':
            # e-Stat retains the old character; the linked MIC code table uses this form.
            item['aliases'] = ['梼原町']
        if code in NORTHERN_FOUR_ISLAND_CODES:
            excluded.append({**item, 'prefectureCode': code[:2],
                'reason': '北方四島の6村。行政コード原表には含まれるが、通信エリアの確認を案内できる情報がないため当サイトの地域ページ対象外。'})
            continue
        pref['municipalities'].append(item)
    prefs = [prefectures[code] for code in sorted(prefectures)]
    municipalities = [m for p in prefs for m in p['municipalities']]
    if [p['code'] for p in prefs] != [f'{n:02d}' for n in range(1, 48)]:
        raise ValueError('The export does not contain all 47 prefectures.')
    if len(excluded) != 6 or len(aggregate) != 1:
        raise ValueError('Excluded-area or aggregate rows changed; review the source.')
    # Every designated ward has a retained, matching city in the same prefecture.
    all_items = {m['code']: m for m in municipalities}
    for m in municipalities:
        if m.get('parentCityCode'):
            city = all_items.get(m['parentCityCode'])
            if not city or city['name'] != m['parentCityName'] or city['code'][:2] != m['code'][:2]:
                raise ValueError('Invalid city/ward relationship: ' + m['code'])
    kinds = dict(sorted(Counter(m['kind'] for m in municipalities).items()))
    return {
        'source': {
            'label': '政府統計の総合窓口（e-Stat）市区町村名・コード',
            'url': BASE_URL, 'downloadUrl': url,
            'checkedAt': as_of.isoformat(), 'asOf': as_of.isoformat(),
            'sha256': hashlib.sha256(raw).hexdigest(),
            'verificationSource': {'label': '総務省 都道府県コード及び市区町村コード',
                'url': SOUMU_SOURCE, 'downloadUrl': 'https://www.soumu.go.jp/main_content/000925835.xlsx',
                'datasetUpdatedAt': '2024-01-01', 'checkedAt': as_of.isoformat(),
                'notes': '2026-11-23取得時点でコード1918件が一致。39405はe-Statの檮原町と総務省の梼原町に字体差があるため、後者も検索用別表記として保持。'},
            'notes': [
                '都道府県は2桁、地域はe-Statの標準地域コード5桁。先頭の0を保持する。',
                '名称・ふりがなは公式CSVから取得。政令市の区名は公式の親市名と区名を連結する。ローマ字slugは推測しない。',
                '政令市本体と行政区は別コードとして保持し、行政区には親市コードを付ける。同じコードの重複は許容しない。',
                '東京都特別区部の集計行は除外し、23特別区をそれぞれ保持する。',
                '北方四島の6村はexcludedMunicipalitiesに原表情報を保存し、地域ページ生成対象から除外する。',
                '行政区域の一覧であり、通信サービスの提供可否・料金・速度を示すデータではない。',
            ],
        },
        'counts': {'prefectures': len(prefs), 'municipalities': len(municipalities),
                   'sourceRows': len(rows), 'kinds': kinds},
        'prefectures': prefs,
        'excludedMunicipalities': excluded,
        'excludedAggregateRows': aggregate,
    }


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--as-of', required=True, type=date.fromisoformat)
    parser.add_argument('--csv', type=Path, help='Use a previously downloaded official CSV.')
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'src/data/japan-municipalities.json')
    args = parser.parse_args()
    url = download_url(args.as_of)
    if args.csv:
        raw = args.csv.read_bytes()
    else:
        with urlopen(Request(url, headers={'User-Agent': 'MunicipalityDirectoryBuilder/1.0'}), timeout=60) as response:
            raw = response.read()
    result = normalize(raw, args.as_of, url)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
