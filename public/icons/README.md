# Real item icons (optional)

The site draws its own stand-in pixel icons. If you want the real textures in your local copy, fill this folder from your own game files:

```
python3 tools/extract_icons.py --mods "<your instance>/mods" --minecraft "<.minecraft>/versions/1.20.1/1.20.1.jar"
```

That writes `<namespace>/<item>.png` files and a `manifest.json` here. Then run `npm run dev` to see them.

Everything in this folder except this README is ignored by git, so the textures stay on your PC and are never published. They belong to Mojang and the mod authors.
