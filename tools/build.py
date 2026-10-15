import os, sys
OUT = sys.argv[1]
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

PAGES = [('index.html', 'Overview'), ('ammo.html', 'Ammo & gun parts'), ('kinetic.html', 'Rotational power'), ('electricity.html', 'Electricity')]

def head(title, desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
'''

def header(active):
    cur = ' aria-current="page"'
    tabs = ''.join('<a href="%s"%s>%s</a>' % (f, cur if f == active else '', n) for f, n in PAGES)
    return f'''<header class="binder">
  <div class="wrap">
    <a class="brand" href="index.html">DeceasedCraft <span>Create Machines</span></a>
    <nav class="tabs-site" aria-label="Pages">{tabs}</nav>
    <button type="button" class="theme-toggle" id="themeToggle">Dark mode</button>
  </div>
</header>
'''

FOOT = '''<footer class="site">
  <div class="wrap">
    <p>Built for DeceasedCraft Beta DH 5.10.17 (Forge 1.20.1, Create 6.0.6). Recipes come from the pack's KubeJS scripts. Machine numbers come from the pack's configs and the source code of Create, Immersive Engineering, Create Crafts &amp; Additions, Create Diesel Generators and Create Big Cannons. If JEI shows something different, trust JEI.</p>
    <p>The 3D views use hand-drawn stand-in textures, not the mods' own.</p>
  </div>
</footer>
'''

def page(fname, title, desc, body, scripts=''):
    html = head(title, desc) + header(fname) + '<main class="wrap">\n' + body + '\n</main>\n' + FOOT + scripts + '</body>\n</html>\n'
    open(os.path.join(OUT, fname), 'w').write(html)

VIEWER_SCRIPTS = '<script src="assets/vendor/three.min.js"></script>\n<script src="assets/vendor/OrbitControls.js"></script>\n<script src="assets/viewer.js"></script>\n'
for fname, title, desc in [
    ('index.html', 'DeceasedCraft Create Machines', 'Compact, resource-efficient Create builds for the DeceasedCraft modpack: ammo, gun parts, rotational power and electricity.'),
    ('ammo.html', 'Ammo & Gun Parts · DeceasedCraft Create Machines', 'Automated ammo and gun-part lines for DeceasedCraft, with 3D layouts.'),
    ('kinetic.html', 'Rotational Power · DeceasedCraft Create Machines', 'Early, mid and late game Create SU generation for DeceasedCraft.'),
    ('electricity.html', 'Electricity · DeceasedCraft Create Machines', 'Early, mid and late game FE generation for DeceasedCraft.')]:
    body = open(os.path.join(HERE, fname.replace('.html', '.body.html'))).read()
    tail = open(os.path.join(HERE, fname.replace('.html', '.init.html'))).read() if os.path.exists(os.path.join(HERE, fname.replace('.html', '.init.html'))) else ''
    scripts = VIEWER_SCRIPTS if fname != 'index.html' else '<script src="assets/viewer.js"></script>\n'
    page(fname, title, desc, body, scripts + tail)
print('built')
