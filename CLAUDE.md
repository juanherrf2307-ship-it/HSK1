# Huǒhuo · Repaso HSK1

App web instalable (PWA) de repaso de chino HSK1 tipo juego, para Juan y 3-4 compañeros de clase.
Publicada con GitHub Pages: https://juanherrf2307-ship-it.github.io/HSK1/

## Reglas que no se rompen
- Pinyin SIEMPRE encima de cada carácter (función `rb` / sintaxis `{汉字|pinyin}`). Nunca caracteres sueltos sin pinyin.
- Nada de speaking ni reconocimiento de voz.
- Las actualizaciones de contenido nunca deben borrar progreso ni racha: añadir palabras, no renombrar el carácter (`h`) de las existentes, porque el progreso (`srs`) se guarda por carácter.
- Contenido nuevo solo se publica después de que Juan revise y dé el OK a la lista.
- Sin anuncios, sin analíticas, sin presión artificial (nada de cuentas atrás). Huǒhuo nunca culpa.

## Estructura
- `js/data.js`: vocabulario por temas (`carácter|pinyin|significado`) y frases (`español||palabra:pin_yin ...`).
- `js/extras.js`: tarjetas «¿Sabías que…?» (gramática) y curiosidades culturales.
- `js/app.js`: lógica (login nombre+código con tolerancia a erratas, repetición espaciada, ejercicios, combos, racha con congelaciones, ranking semanal).
- `js/mascot.js`: Huǒhuo (panda rojo; la cola arde más con la racha).
- Firebase Firestore (proyecto `hsk1-f5548`, plan gratuito): colección `users`.

## Añadir una unidad nueva
1. Leer el PDF nuevo de la carpeta `C:\Users\Juan\Desktop\HSK 1`.
2. Extraer vocabulario y frases; comprobar tonos y erratas de la ficha.
3. Enseñar la lista a Juan y esperar su OK.
4. Añadir al final de `js/data.js` (tema nuevo o ampliando uno), subir la versión de `CACHE` en `sw.js`, commit y push.
