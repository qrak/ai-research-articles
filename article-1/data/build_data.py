#!/usr/bin/env python3
"""Build the dataset behind article-1's empirical section.

Sources: CoinMarketCap's public chart endpoints (unofficial, key-less) and
DefiLlama's open API. Output: article-1/assets/data.js, consumed by charts.js.

    python build_data.py            # fetch, write data.js, print summary

shortcut: CMC's data-api is unofficial and can vanish, swap for their keyed API if it breaks.
"""
import json
import math
import statistics
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "data.js"
UA = {"User-Agent": "Mozilla/5.0 (article-data-build)"}
CUTOFF = date(2025, 11, 1)   # the article's data cut-off; change it and the whole section must be re-read


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.load(r)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as ex:
            if i == tries - 1:
                raise
            print(f"  retry {i + 1} after {ex}", file=sys.stderr)
            time.sleep(3)


def day(ts):
    return datetime.fromtimestamp(ts, timezone.utc).date()


def cmc_global(start, end):
    url = ("https://api.coinmarketcap.com/data-api/v3/global-metrics/quotes/historical"
           f"?format=line&convertId=2781&timeStart={start}&timeEnd={end}&interval=1d")
    return get(url)["data"]["quotes"]


def fetch_dominance(first_year=2013):
    """Daily BTC/ETH dominance and market caps, up to CUTOFF. Chunked per year: one range is ~30 MB."""
    rows = []
    for y in range(first_year, CUTOFF.year + 1):
        s = int(datetime(y, 1, 1, tzinfo=timezone.utc).timestamp())
        stop = min(datetime(y + 1, 1, 1, tzinfo=timezone.utc),
                   datetime(CUTOFF.year, CUTOFF.month, CUTOFF.day, tzinfo=timezone.utc))
        e = int(stop.timestamp())
        if s >= e:
            break
        for q in cmc_global(s, e):
            d = q.get("timestamp", "")[:10]
            btc = q.get("btcDominance")
            if not d or not btc:
                continue
            rows.append({
                "date": d,
                "btc": round(btc, 2),
                "eth": round(q["ethDominance"], 2) if q.get("ethDominance") is not None else None,
                "mcap": q["quote"][0]["totalMarketCap"],
                "alt": q["quote"][0].get("altcoinMarketCap"),
                "active": q.get("activeCryptocurrencies"),
            })
        print(f"  {y}: {len([r for r in rows if r['date'][:4] == str(y)])} days", file=sys.stderr)
    return rows


def yearly(rows):
    """Calendar-year mean/min/max dominance plus year-over-year change of the mean."""
    out = {}
    for r in rows:
        if r["btc"] > 0:
            out.setdefault(r["date"][:4], []).append(r)
    res = []
    for y in sorted(out):
        v = [r["btc"] for r in out[y]]
        res.append({"year": int(y), "avg": round(statistics.mean(v), 1),
                    "low": round(min(v), 1), "high": round(max(v), 1), "n": len(v)})
    for prev, cur in zip(res, res[1:]):
        cur["yoy"] = round(cur["avg"] - prev["avg"], 1)
    res[0]["yoy"] = None
    if res and (CUTOFF.month, CUTOFF.day) < (12, 31):
        res[-1]["partial"] = True   # the cut-off year is only partly observed
    return res


def eth_yearly(rows):
    out = {}
    for r in rows:
        if r["eth"]:
            out.setdefault(r["date"][:4], []).append(r["eth"])
    return [{"year": int(y), "avg": round(statistics.mean(v), 1), "high": round(max(v), 1)}
            for y, v in sorted(out.items())]


def extremes(rows, key):
    best = max(rows, key=lambda r: r[key])
    worst = min(rows, key=lambda r: r[key])
    return {"peak": {"date": best["date"], "value": round(best[key], 1)},
            "low": {"date": worst["date"], "value": round(worst[key], 1)}}


def capital(rows):
    """Month-end total crypto market cap, 2013 onwards."""
    seen = {}
    for r in rows:
        if r["mcap"]:
            seen[r["date"][:7]] = r["mcap"]
    return [{"month": k, "mcap": v} for k, v in sorted(seen.items())]


def monthly(rows):
    """Month-end dominance + active asset count (CMC only publishes the count from 2022)."""
    seen = {}
    for r in rows:
        if r["active"] and r["btc"] > 0:
            seen[r["date"][:7]] = r
    return [{"month": k, "btc": v["btc"], "active": v["active"], "mcap": v["mcap"]}
            for k, v in sorted(seen.items())]


def pearson(x, y):
    mx, my = statistics.mean(x), statistics.mean(y)
    sx = sum((a - mx) ** 2 for a in x)
    sy = sum((b - my) ** 2 for b in y)
    if sx == 0 or sy == 0:
        return 0.0
    r = sum((a - mx) * (b - my) for a, b in zip(x, y)) / math.sqrt(sx * sy)
    return max(-1.0, min(1.0, r))


def p_value(r, n):
    """Two-tailed p for H0: rho = 0, via the t distribution (Student)."""
    if n < 3 or abs(r) >= 1:
        return 0.0 if abs(r) >= 1 else 1.0
    t = r * math.sqrt(n - 2) / math.sqrt(1 - r * r)
    df = n - 2

    def betacf(a, b, x):
        qab, qap, qam = a + b, a + 1, a - 1
        c, d = 1.0, 1 - qab * x / qap
        d = 1 / (d if abs(d) > 1e-300 else 1e-300)
        h = d
        for m in range(1, 300):
            m2 = 2 * m
            aa = m * (b - m) * x / ((qam + m2) * (a + m2))
            d = 1 + aa * d
            d = 1 / (d if abs(d) > 1e-300 else 1e-300)
            c = 1 + aa / c
            c = c if abs(c) > 1e-300 else 1e-300
            h *= d * c
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
            d = 1 + aa * d
            d = 1 / (d if abs(d) > 1e-300 else 1e-300)
            c = 1 + aa / c
            c = c if abs(c) > 1e-300 else 1e-300
            de = d * c
            h *= de
            if abs(de - 1) < 3e-16:
                break
        return h

    def betai(a, b, x):
        if x <= 0 or x >= 1:
            return 0.0 if x <= 0 else 1.0
        lb = (math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b)
              + a * math.log(x) + b * math.log(1 - x))
        bt = math.exp(lb)
        return bt * betacf(a, b, x) / a if x < (a + 1) / (a + b + 2) else 1 - bt * betacf(b, a, 1 - x) / b

    return betai(df / 2, 0.5, df / (df + t * t))


def defi_tvl():
    data = get("https://api.llama.fi/v2/historicalChainTvl")
    pts = [(day(p["date"]).isoformat(), p["tvl"]) for p in data
           if p.get("tvl") and day(p["date"]).isoformat() <= CUTOFF.isoformat()]
    seen = {}
    for d, v in pts:                      # month-end values keep the file small
        seen[d[:7]] = (d, v)
    return [{"month": k, "date": v[0], "tvl": v[1]} for k, v in sorted(seen.items())]


def main():
    print("fetching CMC dominance history…", file=sys.stderr)
    rows = fetch_dominance()
    rows = [r for r in rows if r["btc"] > 0 and r["date"] <= CUTOFF.isoformat()]
    yrs, mon = yearly(rows), monthly(rows)
    print("fetching DefiLlama TVL…", file=sys.stderr)
    tvl = defi_tvl()

    levels = pearson([m["active"] for m in mon], [m["btc"] for m in mon])
    dl_a = [math.log(m["active"]) for m in mon]
    dl_b = [m["btc"] for m in mon]
    diff_a = [b - a for a, b in zip(dl_a, dl_a[1:])]
    diff_b = [b - a for a, b in zip(dl_b, dl_b[1:])]
    stats = {
        "nMonths": len(mon),
        "rLevels": round(levels, 3),
        "pLevels": round(p_value(levels, len(mon)), 4),
        "rDiff": round(pearson(diff_a, diff_b), 3),
        "pDiff": round(p_value(pearson(diff_a, diff_b), len(diff_a)), 4),
        "first": rows[0]["date"],
        "last": rows[-1]["date"],
        "mcapFirst": rows[0]["mcap"],
        "mcapLast": rows[-1]["mcap"],
        "btcNow": rows[-1]["btc"],
        "ethNow": rows[-1]["eth"],
        "ethPeak": extremes(rows, "eth")["peak"],
        "btcPeak": extremes(rows, "btc")["peak"],
        "btcLow": extremes(rows, "btc")["low"],
        "tvlPeak": max(tvl, key=lambda t: t["tvl"]),
        "tvlLast": tvl[-1],
        "activeFirst": mon[0],
        "activePeak": max(mon, key=lambda m: m["active"]),
        "activeLast": mon[-1],
    }
    years = [y["year"] for y in yrs]

    # self-check: the section's claims break silently if the shape changes
    assert len(rows) > 4000, f"too few days: {len(rows)}"
    assert len(yrs) >= 13, f"too few years: {len(yrs)}"
    assert all(0 < y["avg"] < 100 for y in yrs), "dominance out of range"
    assert stats["nMonths"] >= 40, f"too few months with asset counts: {stats['nMonths']}"
    assert stats["mcapLast"] > stats["mcapFirst"] * 100, "market cap series looks wrong"

    payload = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "cutoff": CUTOFF.isoformat(),
        "source": "CoinMarketCap data-api (global metrics, daily) + DefiLlama (chain TVL)",
        "years": list(years),
        "dominance": yrs,
        "eth": eth_yearly(rows),
        "capital": capital(rows),
        "monthly": mon,
        "tvl": tvl,
        "stats": stats,
        "users": [
            # Crypto.com market sizing (total owners) and its 2024 Bitcoin-owner count.
            {"year": 2023, "totalM": 583},
            {"year": 2024, "totalM": 659, "btcOwnersM": 337},
        ],
    }
    OUT.write_text("window.CDE = " + json.dumps(payload, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")

    print("\nyear  avg   low  high   yoy")
    for y in yrs:
        print(f"{y['year']}  {y['avg']:5.1f} {y['low']:5.1f} {y['high']:5.1f}  {str(y['yoy']):>6}")
    print("\nstats:", json.dumps(stats))
    print("tvl months:", len(tvl), "first", tvl[0]["date"], "last", tvl[-1]["date"])


if __name__ == "__main__":
    main()
