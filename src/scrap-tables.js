import * as cheerio from 'cheerio'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execute = async () => {
    const URL =
        'https://borderlands.fandom.com/wiki/Achievement_(Borderlands_3)'
    const OUT_DIR = __dirname

    const res = await fetch(URL)
    const html = await res.text()
    const $ = cheerio.load(html)

    const tables = $('table').toArray().slice(0, 7)

    let allTablesHtml = ''

    for (const table of tables) {
        const $table = $(table)
        const $rows = $table.find('tbody tr')

        const captionText = $table.find('caption i a').text().trim()
        $table
            .find('caption')
            .html(
                `${captionText} - <span class="completed-count">0</span>/<span class="total-count">${
                    $rows.length - 1
                }</span>`,
            )
            .attr('id', captionText)

        $rows.each(async (i, tr) => {
            const achievementId = $(tr).find('td').eq(1).text().trim()

            if (i === 0) {
                $(tr).prepend(
                    `<th></th>`,
                )

                $(tr).find('th').slice(-2).remove()
            } else {
                $(tr).prepend(
                    `<td><input type="checkbox" class="achievement-checkbox" data-achievement-id="${achievementId}" /></td>`,
                )
            }

            const img = $(tr).find('img').first()
            const src = img.attr('data-src') || img.attr('src')

            if (src) {
                const cleanSrc = src.split('/revision/')[0]

                $(tr)
                    .find('td')
                    .eq(1)
                    .html(
                        `<img src="${cleanSrc}" decoding="async" width="64" height="64" class="mw-file-element">`,
                    )
            }

            $(tr).find('td').slice(-2).remove()
        })

        const $thead = $('<thead></thead>').append($table.find('tbody tr').first())
        $table.find('caption').after($thead)

        allTablesHtml += $.html($table) + '\n\n'
    }

    const finalHtml = `
            <!doctype html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <title>Borderlands 3 Achievements</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" type="image/x-icon" href="./BL4_Vault_Favicon_16x16_Dark-01.svg" />
            <meta name="description" content="Borderlands 3 Achievements Tracker">
            <meta name="author" content="Negrii">
            <meta name="keywords" content="Borderlands 3, Achievements, Tracker">
            <link rel="stylesheet" href="./main.css"/>
			<script src="./main.js" defer></script>
            </head>
            <body>
				<h1>Borderlands 3 Achievements Tracker</h1>
                <div class="controls">
                    <button id="hide-checked">Hide Completed</button>
                    <button id="show-all">Show All</button>
                    <button id="reset">Reset All</button>
                </div>
                <p>
                    Logros totales:
                    <span id="total-achievements-completed">0</span>/<span id="total-achievements">0</span>
                </p>
                ${allTablesHtml}
            </body>
            </html>
        `

    const htmlFile = path.join(OUT_DIR, 'index.html')
    await fs.writeFile(htmlFile, finalHtml, 'utf8')
}

execute()
