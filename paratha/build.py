"""Builds Paratha Land pages.
   python build.py            -> dist/ghl/  (paste-ready for GoHighLevel: slugs /, /catering)
                              -> dist/preview/ (index.html, catering.html linked by file name)
   Edit MENU, COUPONS and HOOKS below, then rebuild."""
import json, html, re, pathlib
SRC = pathlib.Path(__file__).parent
DOMAIN = "https://parathaland.ca"
PHONE, PHONE_TXT = "+16043409237", "(604) 340-9237"
GOOGLE = "https://share.google/xiSuF9gGfN1qYML7r"
MAPS = "https://www.google.com/maps/search/?api=1&query=Paratha+Land+20381+62+Ave+Unit+301+Langley+BC"

# GoHighLevel inbound-webhook URLs (Automation > Workflows > trigger "Inbound Webhook"). Empty = text/call fallback.
HOOKS = {"order": "", "club": "", "catering": "", "truck": ""}

# Codes must also exist in GoHighLevel (Payments > Coupons) so the Square payment matches.
COUPONS = [
    {"code": "WELCOME10", "type": "percent", "value": 10, "min": 0, "label": "10% off your first direct order"},
    {"code": "PLATE3", "type": "amount", "value": 3, "min": 30, "label": "$3 off orders of $30 or more"},
]

# Menu from "Paratha Land - Google Menu.xlsx" (25 Nov 2026). Names and prices match the sheet exactly.
# (id, name, price, short description, popular)
MENU = [
  {"id": "plates", "name": "Paratha plates", "pa": "ਪਰਾਠਾ ਪਲੇਟ", "note": "Full plates: parathas, pooris and makki roti with their curries.", "items": [
    ("aloo-paratha-plate", "Aloo Paratha Plate", 17.49, "Our signature: parathas stuffed with spiced potato, served as a full plate.", True),
    ("gobi-paratha-plate", "Gobi Paratha Plate", 18.99, "Parathas stuffed with spiced grated cauliflower, served as a full plate.", True),
    ("paneer-paratha-plate", "Paneer Paratha Plate", 19.99, "Parathas stuffed with spiced paneer, served as a full plate.", False),
    ("paneer-bhurji-paratha-plate", "Paneer Bhurji Paratha Plate", 18.99, "Parathas filled with spiced scrambled paneer.", False),
    ("mooli-paratha-plate", "Mooli Paratha Plate", 18.49, "Parathas stuffed with spiced grated radish.", False),
    ("methi-paratha-plate", "Methi Paratha Plate", 14.49, "Parathas made with fresh fenugreek leaves.", False),
    ("makki-methi-paratha-plate", "Makki Methi Paratha Plate", 18.99, "Cornmeal and fenugreek parathas.", False),
    ("makki-methi-mooli-paratha-plate", "Makki Methi Mooli Paratha Plate", 19.99, "Cornmeal parathas with fenugreek and radish.", False),
    ("jeera-aloo-and-paratha-plate", "Jeera Aloo And Paratha Plate", 16.99, "Cumin potatoes with parathas.", False),
    ("baingan-bhartha-and-paratha-plate", "Baingan Bhartha And Paratha Plate", 15.99, "Smoky mashed eggplant with parathas.", False),
    ("saag-and-makki-roti", "Saag And Makki Roti", 16.99, "Slow-cooked Punjabi greens with maize-flour roti.", False),
    ("saag-and-makki-roti-plate", "Saag And Makki Roti Plate", 17.99, "Saag and makki roti, served as a full plate.", False),
    ("chhole-poori-plate", "Chhole Poori Plate", 15.99, "Spiced chickpeas with puffed pooris.", False),
    ("chhole-halwa-poori-plate", "Chhole Halwa Poori Plate", 15.99, "Chickpeas and pooris with sweet sooji halwa.", False),
    ("aloo-poori-plate", "Aloo Poori Plate", 15.99, "Spiced potato curry with puffed pooris.", False),
    ("black-channe-poori-and-sooji-halwa", "Black Channe, Poori And Sooji Halwa", 17.99, "Black chickpeas, pooris and sooji halwa.", False),
    ("samosa-chaat", "Samosa Chaat", 9.50, "Crushed samosa topped with chutneys and yogurt.", False),
  ]},
  {"id": "parathas", "name": "Parathas & rotis", "pa": "ਪਰਾਠੇ ਤੇ ਰੋਟੀਆਂ", "note": "Single pieces, to add on or build your own spread.", "items": [
    ("aloo-paratha", "Aloo Paratha", 6.49, "Whole wheat flatbread stuffed with spiced potato.", True),
    ("gobi-paratha", "Gobi Paratha", 6.99, "Stuffed with spiced grated cauliflower.", False),
    ("paneer-paratha", "Paneer Paratha", 8.99, "Stuffed with spiced paneer.", True),
    ("mooli-paratha", "Mooli Paratha", 7.49, "Stuffed with spiced grated radish.", False),
    ("methi-paratha", "Methi Paratha", 5.99, "Whole wheat with fresh fenugreek leaves.", False),
    ("mix-veg-paratha", "Mix Veg Paratha", 5.99, "Stuffed with chopped mixed vegetables.", False),
    ("missi-roti-dal-paratha", "Missi Roti/Dal Paratha", 6.99, "Spiced gram-flour missi roti, or a lentil-stuffed paratha.", False),
    ("makki-methi-paratha", "Makki Methi Paratha", 7.99, "Cornmeal flatbread with fenugreek.", False),
    ("makki-methi-mooli-paratha", "Makki Methi Mooli Paratha", 7.99, "Cornmeal flatbread with fenugreek and radish.", False),
    ("namak-ajwain-parantha", "Namak Ajwain Parantha", 4.99, "Layered with salt and carom seeds.", False),
    ("chinni-paratha", "Chinni Paratha", 4.99, "A sweet paratha made with sugar.", False),
    ("plain-paratha", "Plain Paratha", 3.99, "Flaky, layered and buttery.", False),
    ("makki-roti", "Makki Roti", 4.99, "Maize-flour flatbread from a hot tawa.", False),
    ("bajra-roti", "Bajra Roti", 5.99, "Pearl millet flatbread.", False),
    ("jowar-roti", "Jowar Roti", 5.99, "Sorghum flatbread.", False),
    ("tawa-roti", "Tawa Roti", 1.99, "Plain whole wheat roti.", False),
    ("samosa", "Samosa", 3.00, "Crisp pastry filled with spiced potato.", False),
  ]},
  {"id": "bowls", "name": "Rice bowls", "pa": "ਰਾਈਸ ਬਾਊਲ", "note": "Curry over basmati rice.", "items": [
    ("rajma-chawal", "Rajma Chawal", 16.99, "Kidney bean curry over basmati rice.", False),
    ("kadhi-chawal", "Kadhi Chawal", 16.99, "Yogurt curry with gram-flour pakoras over rice.", False),
    ("dal-chawal", "Dal Chawal", 14.99, "Lentils over basmati rice.", False),
    ("dal-khichdi", "Dal Khichdi", 16.99, "Rice and lentils cooked together, soft and comforting.", False),
    ("matar-paneer-and-rice", "Matar Paneer And Rice", 18.99, "Paneer and green peas curry with basmati rice.", False),
    ("shahi-paneer-and-rice", "Shahi Paneer And Rice", 18.99, "Creamy shahi paneer with basmati rice.", False),
  ]},
  {"id": "curries", "name": "Curries", "pa": "ਦਾਲ ਸਬਜ਼ੀ", "note": "On their own, or with a roti or two.", "items": [
    ("shahi-paneer", "Shahi Paneer", 16.99, "Paneer in a rich, creamy tomato gravy.", False),
    ("matar-paneer", "Matar Paneer", 16.99, "Paneer and green peas in onion-tomato gravy.", False),
    ("rajma", "Rajma", 15.99, "Kidney beans in onion-tomato gravy.", False),
    ("white-cholle", "White Cholle", 14.99, "White chickpeas in a spiced gravy.", False),
    ("kadhi-pakora", "Kadhi Pakora", 14.99, "Tangy yogurt curry with gram-flour pakoras.", False),
    ("jeera-aloo", "Jeera Aloo", 14.99, "Potatoes tossed with cumin.", False),
    ("baingan-bhartha", "Baingan Bhartha", 13.99, "Fire-roasted eggplant mashed with onion and tomato.", False),
  ]},
  {"id": "sweets", "name": "Sweets & desserts", "pa": "ਮਿੱਠਾ", "note": "Halwa, seviyan, rasmalai and more.", "items": [
    ("gajar-halwa", "Gajar Halwa", 9.99, "Slow-cooked carrot halwa.", False),
    ("moong-dal-halwa", "Moong Dal Halwa", 8.50, "Roasted moong lentils cooked with ghee and sugar.", False),
    ("sooji-halwa", "Sooji Halwa", 9.50, "Semolina halwa made with ghee.", False),
    ("desi-ghee-choori", "Desi Ghee Choori", 8.99, "Crumbled roti mixed with desi ghee and sugar.", False),
    ("gur-chawal", "Gur Chawal", 16.99, "Rice sweetened with jaggery.", False),
    ("jarda-rice", "Jarda Rice", 15.99, "Sweet, golden basmati rice.", False),
    ("seviyan", "Seviyan", 9.99, "Vermicelli pudding.", False),
    ("meethi-seviyan", "Meethi Seviyan", 9.50, "Sweet roasted vermicelli.", False),
    ("rasmalai", "Rasmalai", 6.99, "Soft paneer dumplings in sweetened milk.", False),
    ("mango-kesari", "Mango Kesari", 12.49, "Semolina pudding with mango.", False),
    ("fruit-custard", "Fruit Custard", 9.50, "Chilled custard with fruit.", False),
    ("fruit-cream", "Fruit Cream", 11.50, "Fruit folded into sweetened cream.", False),
  ]},
  {"id": "drinks", "name": "Drinks", "pa": "ਚਾਹ ਤੇ ਲੱਸੀ", "note": "Chai, lassi, shakes and coolers.", "items": [
    ("tea", "Tea", 3.99, "Fresh-brewed chai.", False),
    ("masala-tea", "Masala Tea", 3.99, "Chai with warming spices.", False),
    ("elaichi-tea", "Elaichi Tea", 3.99, "Cardamom chai.", False),
    ("cinnamon-tea", "Cinnamon Tea", 3.99, "Chai with cinnamon.", False),
    ("ginger-tea", "Ginger Tea", 4.50, "Chai with fresh ginger.", False),
    ("saunf-tea", "Saunf Tea", 4.50, "Chai with fennel.", False),
    ("ajwaini-tea", "Ajwaini Tea", 4.50, "Chai with carom seeds.", False),
    ("gurwali-tea", "Gurwali Tea", 4.99, "Chai sweetened with jaggery.", False),
    ("dudh-patti", "Dudh Patti", 6.50, "Tea leaves brewed in milk.", False),
    ("lassi-sweet", "Lassi (Sweet)", 8.50, "Chilled sweet yogurt drink.", False),
    ("lassi-salted", "Lassi (Salted)", 8.50, "Chilled salted yogurt drink.", False),
    ("mango-shake", "Mango Shake", 7.99, "Mango blended with milk.", False),
    ("banana-shake", "Banana Shake", 7.99, "Banana blended with milk.", False),
    ("jal-jeera", "Jal Jeera", 4.99, "Tangy cumin cooler.", False),
    ("roohafza", "Roohafza", 6.99, "Chilled rose sharbat.", False),
    ("coca-cola", "Coca Cola", 2.99, "Soft drink.", False),
    ("pepsi", "Pepsi", 2.99, "Soft drink.", False),
  ]},
  {"id": "sides", "name": "Sides", "pa": "ਦਹੀਂ ਤੇ ਅਚਾਰ", "note": "Add to any order.", "items": [
    ("butter", "Butter", 0.75, "An extra slab for your paratha.", False),
    ("pickle", "Pickle", 0.75, "Achar.", False),
    ("yogurt", "Yogurt", 2.75, "Dahi.", False),
    ("salad", "Salad", 1.50, "Fresh side salad.", False),
  ]},
]

HOME_FAQ = [
  ("Where can I get aloo paratha in Langley?", "At Paratha Land, 20381 62 Ave, Unit 301, Langley, BC. Order on this website for pickup. The aloo paratha plate is our signature, and single aloo parathas are on the menu too."),
  ("Is the whole menu vegetarian?", "Yes. Every item on our current menu is vegetarian: stuffed parathas, rotis, rice bowls and curries."),
  ("Do you have sweets and chai?", "Yes. We make desserts like gajar halwa, moong dal halwa, rasmalai and seviyan, and serve chai (masala, elaichi, ginger, gurwali and more), dudh patti, lassi and shakes."),
  ("Do you have coupons or a rewards program?", "Join the Paratha Club with your phone number to get a welcome code and members-only offers by text. New customers can use WELCOME10 for 10% off their first direct order."),
  ("Do you do catering or bring a food truck to events?", "Yes. We cater birthdays, office lunches and family functions, and our food truck can cook fresh parathas on-site at concerts, festivals, melas and corporate events. Send a request on our catering page."),
  ("What are makki roti and bajra roti?", "Makki roti is a Punjabi flatbread made from maize (corn) flour. Bajra roti is made from pearl millet flour. Both are cooked on a hot griddle and are traditionally eaten with saag."),
  ("What is a paratha?", "A paratha is a pan-fried whole wheat flatbread from North India. Stuffed parathas like aloo, gobi or paneer are filled with spiced vegetables or cheese, rolled thin and cooked with ghee or butter on a tawa."),
]
CAT_FAQ = [
  ("What kinds of events do you cater?", "Birthdays, office and corporate lunches, family functions, community events and parties. We make parathas, curries and rice in quantities sized to your guest count."),
  ("How does the food truck work?", "We bring the truck to your event and cook parathas fresh on-site, so guests get them hot off the tawa. It suits concerts, festivals, melas, corporate events, weddings and school events."),
  ("How do I get a quote?", "Send the form with your date, location and guest count. We'll reply by phone or text with menu options and a quote."),
  ("Is the catering menu vegetarian?", "Yes. Everything we make is vegetarian, which makes it easy to feed a mixed crowd."),
  ("Do you travel outside Langley?", "Tell us where your event is in the form. We'll confirm whether we can bring catering or the food truck to your location."),
]

TRUCK_SVG = """<svg viewBox="0 0 560 330" role="img" aria-label="Illustration of the Paratha Land food truck with a hot tawa in its window">
<defs><pattern id="phul" width="32" height="22" patternUnits="userSpaceOnUse"><rect width="32" height="22" fill="#3d0a12"/><path d="M8 2 17 11 8 20-1 11Z" fill="#f3b53f"/><path d="M8 6 13 11 8 16 3 11Z" fill="#ee7a1c"/><circle cx="24" cy="11" r="2.4" fill="#e04d7c"/></pattern>
<linearGradient id="bodyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1828"/><stop offset="1" stop-color="#4a0d14"/></linearGradient></defs>
<ellipse cx="280" cy="300" rx="250" ry="16" fill="#000" opacity=".22"/>
<g class="steam" fill="none" stroke="#fbf1dc" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M150 72c-12-14 12-22 0-38"/><path d="M190 64c-12-14 12-22 0-38"/><path d="M230 72c-12-14 12-22 0-38"/></g>
<rect x="36" y="84" width="404" height="186" rx="20" fill="url(#bodyg)"/>
<rect x="36" y="84" width="404" height="30" rx="14" fill="url(#phul)"/><rect x="36" y="108" width="404" height="6" fill="#f3b53f"/>
<path d="M440 124h56c26 0 40 18 46 44l8 40v62h-110z" fill="#5c1220"/><path d="M452 136h40c14 0 22 10 26 26l6 26h-72z" fill="#2a060c" stroke="#f3b53f" stroke-width="3"/>
<rect x="76" y="134" width="226" height="84" rx="6" fill="#2a060c" stroke="#f3b53f" stroke-width="4"/>
<g fill="#f3b53f"><path d="M70 128h238l-14 18h-210z"/></g><g fill="#ee7a1c"><path d="M88 128h18l-6 18h-12zM130 128h18l-6 18h-12zM172 128h18l-6 18h-12zM214 128h18l-6 18h-12zM256 128h18l-6 18h-12z"/></g>
<ellipse cx="190" cy="204" rx="80" ry="12" fill="#1a1412"/><ellipse cx="190" cy="198" rx="58" ry="11" fill="#e3a650"/><g fill="#874015"><circle cx="170" cy="197" r="3"/><circle cx="196" cy="200" r="2.4"/><circle cx="214" cy="195" r="3"/><circle cx="184" cy="193" r="2"/></g>
<text x="238" y="252" text-anchor="middle" font-family="Rozha One, Georgia, serif" font-size="32" fill="#f3b53f">Paratha Land</text>
<g fill="#e04d7c"><circle cx="62" cy="244" r="7"/><circle cx="414" cy="244" r="7"/></g><g fill="#f3b53f"><circle cx="62" cy="244" r="3"/><circle cx="414" cy="244" r="3"/></g>
<rect x="330" y="140" width="90" height="70" rx="6" fill="#fbf1dc"/><text x="375" y="170" text-anchor="middle" font-family="Yatra One, serif" font-size="15" fill="#3d0a12">Hot</text><text x="375" y="192" text-anchor="middle" font-family="Yatra One, serif" font-size="15" fill="#3d0a12">parathas</text>
<g><circle cx="128" cy="272" r="32" fill="#1c1412"/><circle cx="128" cy="272" r="13" fill="#f3b53f"/><circle cx="470" cy="272" r="32" fill="#1c1412"/><circle cx="470" cy="272" r="13" fill="#f3b53f"/></g>
</svg>"""

TRAY_SVG = """<svg viewBox="0 0 560 330" role="img" aria-label="Illustration of a catering tray with stacked parathas, curry and rice">
<ellipse cx="280" cy="292" rx="240" ry="20" fill="#000" opacity=".18"/>
<ellipse cx="280" cy="250" rx="236" ry="56" fill="#9a958d"/><ellipse cx="280" cy="242" rx="236" ry="56" fill="#cfc9bf"/><ellipse cx="280" cy="240" rx="212" ry="46" fill="#e3ddd2"/>
<g><ellipse cx="200" cy="232" rx="96" ry="26" fill="#b97a32"/><ellipse cx="200" cy="222" rx="96" ry="26" fill="#d99a45"/><ellipse cx="200" cy="212" rx="96" ry="26" fill="#e8b462"/><g fill="#874015"><circle cx="170" cy="210" r="4"/><circle cx="214" cy="216" r="3"/><circle cx="236" cy="206" r="4"/><circle cx="190" cy="202" r="2.6"/></g><rect x="186" y="194" width="30" height="16" rx="4" fill="#f7df8e"/></g>
<g><ellipse cx="380" cy="222" rx="62" ry="22" fill="#a9a399"/><ellipse cx="380" cy="214" rx="56" ry="18" fill="#c2401c"/><g fill="#ee7a1c"><circle cx="366" cy="212" r="5"/><circle cx="392" cy="216" r="4"/><circle cx="380" cy="208" r="4"/></g></g>
<g><ellipse cx="300" cy="262" rx="50" ry="16" fill="#a9a399"/><ellipse cx="300" cy="256" rx="44" ry="12" fill="#f6f0e2"/></g>
<g fill="none" stroke="#fbf1dc" stroke-width="5" stroke-linecap="round" opacity=".6"><path d="M180 170c-12-14 12-22 0-38"/><path d="M222 160c-12-14 12-22 0-38"/><path d="M380 180c-12-14 12-22 0-38"/></g>
</svg>"""

BRAND_SVG = """<svg class="brand-mark" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="#3d0a12" stroke="#f3b53f" stroke-width="2"/><g fill="#f3b53f"><path d="M22 2l2 3-2 3-2-3z"/><path d="M22 36l2 3-2 3-2-3z"/><path d="M2 22l3-2 3 2-3 2z"/><path d="M36 22l3-2 3 2-3 2z"/></g><circle cx="22" cy="22" r="12" fill="#e3a650"/><g fill="#874015"><circle cx="18" cy="18" r="2"/><circle cx="26" cy="17" r="1.5"/><circle cx="25" cy="26" r="2.2"/><circle cx="17" cy="26" r="1.4"/></g></svg>"""

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Mukta+Mahee:wght@400;500;700&family=Rozha+One&family=Yatra+One&display=swap" rel="stylesheet">'

ARROW = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def e(s): return html.escape(s, quote=True)

def menu_html():
    tabs = "".join(f'<button type="button" data-target="cat-{c["id"]}">{e(c["name"])}</button>' for c in MENU)
    out = []
    for c in MENU:
        items = []
        for (iid, name, price, desc, pop) in c["items"]:
            items.append(f'''<article class="dish" data-id="{iid}" data-name="{e(name)}" data-price="{price:.2f}">
<div class="dish-top"><span class="veg" title="Vegetarian"><span class="sr">Vegetarian</span></span><h4>{e(name)}</h4>{'<span class="pop">Popular</span>' if pop else ''}<i class="leader" aria-hidden="true"></i><span class="price">${price:.2f}</span></div>
<p>{e(desc)}</p>
<button class="add" type="button" aria-label="Add {e(name)} to your order"><span class="q" aria-hidden="true"></span><span class="plus" aria-hidden="true">+</span> Add</button>
</article>''')
        out.append(f'''<section class="cat" id="cat-{c["id"]}" aria-labelledby="h-{c["id"]}">
<header class="cat-head"><h3 id="h-{c["id"]}">{e(c["name"])}</h3><span class="pa" lang="pa">{c["pa"]}</span><p>{e(c["note"])}</p></header>
<div class="dishes">{"".join(items)}</div></section>''')
    return tabs, "".join(out)

def faq_html(faq):
    return "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq)

ADDRESS = {"@type": "PostalAddress", "streetAddress": "20381 62 Ave, Unit 301", "addressLocality": "Langley", "addressRegion": "BC", "postalCode": "V3A 5E6", "addressCountry": "CA"}

def jsonld_home():
    sections = [{"@type": "MenuSection", "name": c["name"], "hasMenuItem": [
        {"@type": "MenuItem", "name": n, "description": d, "suitableForDiet": "https://schema.org/VegetarianDiet",
         "offers": {"@type": "Offer", "price": f"{p:.2f}", "priceCurrency": "CAD"}} for (_, n, p, d, _) in c["items"]]} for c in MENU]
    g = [
      {"@type": "Restaurant", "@id": DOMAIN + "/#restaurant", "name": "Paratha Land", "url": DOMAIN + "/",
       "slogan": "Always made fresh", "logo": DOMAIN + "/brand/logo.jpg", "image": DOMAIN + "/brand/logo.jpg",
       "description": "Hand-stuffed Punjabi parathas, rotis, rice bowls, curries, sweets and chai in Langley, BC. Always made fresh. 100% vegetarian. Online ordering for pickup, catering and food truck service for events.",
       "telephone": "+1-604-340-9237", "address": ADDRESS, "hasMap": MAPS, "priceRange": "$",
       "servesCuisine": ["Indian", "Punjabi", "North Indian", "Indian street food", "Vegetarian"],
       "acceptsReservations": False, "hasMenu": {"@id": DOMAIN + "/#menu"}, "areaServed": {"@type": "City", "name": "Langley, BC"},
       "keywords": "paratha Langley, aloo paratha, Indian food Langley, Punjabi food, Indian street food, vegetarian Indian, Indian catering Langley, Indian food truck",
       "potentialAction": {"@type": "OrderAction", "target": {"@type": "EntryPoint", "urlTemplate": DOMAIN + "/#order",
           "actionPlatform": ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"]},
           "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModePickUp"},
       "makesOffer": [{"@type": "Offer", "itemOffered": {"@id": DOMAIN + "/catering#catering"}}, {"@type": "Offer", "itemOffered": {"@id": DOMAIN + "/catering#food-truck"}}]},
      {"@type": "Menu", "@id": DOMAIN + "/#menu", "name": "Paratha Land menu", "inLanguage": "en-CA", "hasMenuSection": sections},
      {"@type": "WebSite", "@id": DOMAIN + "/#website", "url": DOMAIN + "/", "name": "Paratha Land", "inLanguage": "en-CA", "publisher": {"@id": DOMAIN + "/#restaurant"}},
      {"@type": "FAQPage", "@id": DOMAIN + "/#faq", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in HOME_FAQ]},
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False)

def jsonld_catering():
    prov = {"@type": "Restaurant", "@id": DOMAIN + "/#restaurant", "name": "Paratha Land", "slogan": "Always made fresh", "logo": DOMAIN + "/brand/logo.jpg", "telephone": "+1-604-340-9237", "address": ADDRESS, "url": DOMAIN + "/"}
    g = [
      prov,
      {"@type": "Service", "@id": DOMAIN + "/catering#catering", "serviceType": "Indian vegetarian catering", "name": "Paratha Land catering",
       "description": "Vegetarian Punjabi catering for birthdays, office lunches, corporate events and family functions: stuffed parathas, curries and rice bowls in party quantities.",
       "provider": {"@id": DOMAIN + "/#restaurant"}, "areaServed": {"@type": "City", "name": "Langley, BC"}, "url": DOMAIN + "/catering"},
      {"@type": "Service", "@id": DOMAIN + "/catering#food-truck", "serviceType": "Food truck for events", "name": "Paratha Land food truck",
       "description": "Paratha Land's food truck cooks fresh parathas on-site at concerts, festivals, melas, weddings and corporate events.",
       "provider": {"@id": DOMAIN + "/#restaurant"}, "areaServed": {"@type": "City", "name": "Langley, BC"}, "url": DOMAIN + "/catering#truck"},
      {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN + "/"}, {"@type": "ListItem", "position": 2, "name": "Catering & food truck", "item": DOMAIN + "/catering"}]},
      {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in CAT_FAQ]},
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False)

def chrome(links, active):
    nav = [("Menu", links["order"]), ("Catering & truck", links["catering"]), ("Rewards", links["rewards"]), ("Visit", links["visit"])]
    lis = "".join(f'<li><a href="{h}"{" aria-current=\"page\"" if t == active else ""}>{t}</a></li>' for t, h in nav)
    header = f'''<header class="nav"><a class="brand" href="{links["home"]}"><img class="brand-logo" src="/brand/logo-mark-ink.png" alt="Paratha Land" width="560" height="139"></a>
<nav aria-label="Main"><ul>{lis}</ul></nav>
<a class="btn btn-gold nav-cta" href="{links["order"]}">Order pickup</a>
<button class="burger" type="button" data-menu-open aria-label="Open menu"><svg viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>
<div class="mnav" role="dialog" aria-label="Menu"><button class="burger x" type="button" data-menu-close aria-label="Close menu" style="display:block"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
<img src="/brand/belan.png" alt="" width="600" height="87" style="width:180px;height:auto;margin-bottom:18px"><a href="{links["home"]}">Home</a>{"".join(f'<a href="{h}">{t}</a>' for t, h in nav)}<a href="tel:{PHONE}">Call {PHONE_TXT}</a></div>'''
    footer = f'''<footer class="foot"><div class="foot-grid">
<div><a class="brand" href="{links["home"]}"><img class="foot-logo" src="/brand/logo-mark-cream.png" alt="Paratha Land" width="560" height="139" loading="lazy"></a><p style="margin:18px 0 0;max-width:300px">Hand-stuffed Punjabi parathas, always made fresh in Langley, BC. Fully vegetarian. <span lang="pa" class="pa" style="color:var(--gold)">ਘਰ ਵਰਗਾ ਸੁਆਦ</span></p></div>
<div><h4>Order</h4><ul><li><a href="{links["order"]}">Pickup menu</a></li><li><a href="{links["rewards"]}">Paratha Club rewards</a></li><li><a href="{links["catering"]}">Catering</a></li><li><a href="{links["truck"]}">Book the food truck</a></li></ul></div>
<div><h4>Find us</h4><address>20381 62 Ave, Unit 301<br>Langley, BC V3A 5E6<br><a href="tel:{PHONE}">{PHONE_TXT}</a></address></div>
<div><h4>Google</h4><ul><li><a href="{GOOGLE}" target="_blank" rel="noopener">Hours &amp; reviews</a></li><li><a href="{MAPS}" target="_blank" rel="noopener">Directions</a></li><li><a href="{links["faq"]}">Questions</a></li></ul></div>
</div><div class="foot-base"><span>© <span id="yr">2026</span> Paratha Land, Langley BC</span><span>Paratha · Aloo paratha · Indian street food · Punjabi food in Langley</span></div></footer>'''
    return header, footer

def build(mode):
    if mode == "ghl":
        home, cat = "/", "/catering"
    else:
        home, cat = "index.html", "catering.html"
    links = {"home": home, "order": f"{home}#order" if mode != "ghl" else "/#order", "rewards": f"{home}#rewards" if mode != "ghl" else "/#rewards",
             "visit": f"{home}#visit" if mode != "ghl" else "/#visit", "faq": f"{home}#faq" if mode != "ghl" else "/#faq", "catering": cat, "truck": f"{cat}#truck"}
    css = (SRC / "site.css").read_text()
    common = (SRC / "common.js").read_text()
    cfg = "window.PL=" + json.dumps({"phone": PHONE, "gst": 0.05, "hooks": HOOKS, "coupons": COUPONS}) + ";"
    tabs, menu = menu_html()
    out = SRC.parent / "dist" / mode; out.mkdir(parents=True, exist_ok=True)
    for page, active, ld in [("index", None, jsonld_home()), ("catering", "Catering & truck", jsonld_catering())]:
        header, footer = chrome(links, active)
        t = (SRC / f"{page}.tpl.html").read_text()
        rep = {"CSS": css, "COMMON_JS": common, "CONFIG": cfg, "HEADER": header, "FOOTER": footer, "JSONLD": ld, "FONTS": FONTS,
               "MENU_TABS": tabs, "MENU_HTML": menu, "HOME_FAQ": faq_html(HOME_FAQ), "CAT_FAQ": faq_html(CAT_FAQ),
               "TRUCK_SVG": TRUCK_SVG, "TRAY_SVG": TRAY_SVG, "ARROW": ARROW, "PHONE": PHONE, "PHONE_TXT": PHONE_TXT,
               "GOOGLE": GOOGLE, "MAPS": MAPS, "DOMAIN": DOMAIN, **{"L_" + k.upper(): v for k, v in links.items()}}
        if page == "index":
            rep["SCENE_JS"] = (SRC / "scene.js").read_text(); rep["ORDER_JS"] = (SRC / "order.js").read_text()
        t = re.sub(r"\{\{(\w+)\}\}", lambda m: rep[m.group(1)], t)
        (out / f"{page}.html").write_text(t)
    return out

if __name__ == "__main__":
    for m in ("ghl", "preview"):
        print(build(m))
