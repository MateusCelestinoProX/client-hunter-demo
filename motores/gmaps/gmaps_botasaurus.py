#!/usr/bin/env python3
"""
Motor Nativo Google Maps Scraper (Integrado do repositório google-maps-extractor).
Powered by Botasaurus Anti-Detect Driver / Headless Browser.
Custo: R$ 0,00 (sem consumo de créditos de APIs pagas).
"""

import sys
import json
import re
import os
import argparse
from datetime import datetime

def clean_text(val):
    if not val:
        return ""
    # Remove ícones e caracteres estranhos do Google Maps (como \ue0c8, \ue0b0)
    cleaned = re.sub(r'[\ue000-\uf8ff]', '', str(val)).strip()
    return cleaned

def extrair_place_id(url):
    """Extrai ou sintetiza um ID único determinístico para deduplicação no banco."""
    if not url:
        return None
    # Tenta extrair place_id clássico ou hexadecimal chij do Google Maps
    m = re.search(r'!1s(0x[0-9a-f]+:[0-9a-f]+)', url)
    if m:
        return m.group(1)
    # Tenta extrair do path /place/Nome/@lat,lng
    m2 = re.search(r'/place/([^/@]+)', url)
    if m2:
        return f"gmaps_{m2.group(1)}"
    return f"gmaps_{hash(url)}"

def run_scraper_botasaurus(query, max_results=10, lang="pt-BR"):
    try:
        from botasaurus.browser import browser, Driver, Wait
    except ImportError:
        return {
            "error": "BOTASAURUS_NOT_INSTALLED",
            "message": "A biblioteca 'botasaurus' não está instalada no ambiente Python local. Use 'pip install botasaurus' ou use o motor 'superpool-apify' como fallback."
        }

    @browser(headless=True)
    def _execute(driver: Driver, data):
        q = data["query"]
        max_items = data.get("max", 10)
        l = data.get("lang", "pt-BR")
        
        encoded_query = q.replace(" ", "+")
        url = f"https://www.google.com/maps/search/{encoded_query}?hl={l}"
        
        driver.get(url)
        driver.sleep(3)
        
        # Bypass em consentimento de cookies se aparecer
        try:
            consent_btn = driver.select('button[aria-label*="Aceitar"], button[aria-label*="Concordo"], form[action*="consent"] button')
            if consent_btn:
                consent_btn.click()
                driver.sleep(2)
        except Exception:
            pass

        feed = driver.select('[role="feed"]', Wait.LONG)
        links = []
        if not feed:
            if "/maps/place/" in driver.current_url:
                links = [driver.current_url]
            else:
                return []
        else:
            scroll_attempts = 0
            max_scrolls = max(5, max_items // 2)
            while len(links) < max_items and scroll_attempts < max_scrolls:
                feed.scroll_to_bottom()
                driver.sleep(2)
                cards = driver.select_all('div[role="article"], div.Nv2PK')
                for card in cards:
                    link_el = card.select('a[href*="/maps/place/"]')
                    if link_el:
                        href = link_el.get_attribute('href')
                        if href and href not in links:
                            links.append(href)
                            if len(links) >= max_items:
                                break
                scroll_attempts += 1

        results = []
        for link in links[:max_items]:
            try:
                driver.get(link)
                driver.sleep(2)
                
                name_el = driver.select('h1')
                name = clean_text(name_el.text) if name_el else ""
                
                rating_el = driver.select('div.F7nice span[aria-hidden="true"]')
                rating = clean_text(rating_el.text) if rating_el else ""
                
                reviews_el = driver.select('div.F7nice span span span')
                reviews = clean_text(reviews_el.text).replace('(', '').replace(')', '') if reviews_el else ""
                
                addr_el = driver.select('button[data-item-id="address"]')
                address = clean_text(addr_el.text) if addr_el else ""
                
                phone_el = driver.select('button[data-item-id*="phone"]')
                phone = clean_text(phone_el.text) if phone_el else ""
                
                web_el = driver.select('a[data-item-id="authority"]')
                website = web_el.get_attribute('href') if web_el else ""
                
                cat_el = driver.select('button[jsaction*="category"]')
                category = clean_text(cat_el.text) if cat_el else ""
                
                place_id = extrair_place_id(link)

                results.append({
                    "id": place_id,
                    "title": name,
                    "categoryName": category,
                    "phone": phone,
                    "website": website,
                    "address": address,
                    "totalScore": float(rating.replace(',', '.')) if rating else None,
                    "reviewsCount": int(re.sub(r'\D', '', reviews)) if reviews else 0,
                    "url": link
                })
            except Exception as ex:
                continue

        return results

    return _execute(data={"query": query, "max": max_results, "lang": lang})

def main():
    parser = argparse.ArgumentParser(description="Google Maps Botasaurus Scraper Engine")
    parser.add_argument("query", type=str, help="Termo de pesquisa no Maps")
    parser.add_argument("-m", "--max", type=int, default=10, help="Quantidade máxima")
    parser.add_argument("--lang", type=str, default="pt-BR", help="Idioma")
    parser.add_argument("--json", action="store_true", help="Saída em JSON puro no stdout")
    
    args = parser.parse_args()
    
    res = run_scraper_botasaurus(args.query, max_results=args.max, lang=args.lang)
    
    if args.json:
        print(json.dumps(res, ensure_ascii=False))
    else:
        if isinstance(res, dict) and "error" in res:
            print(f"[!] Erro: {res['message']}", file=sys.stderr)
            sys.exit(1)
        print(f"[+] Total coletado: {len(res)}")
        for r in res:
            print(f" - {r.get('title')} ({r.get('phone')}) - {r.get('address')}")

if __name__ == "__main__":
    main()
