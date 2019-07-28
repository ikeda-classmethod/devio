/**
 * 設定
 */
var SETTINGS = {
    // ファイルIDごとに設定を記載する
    "17kjuq_tudD2N9RdAr8PCJDB3d-YDjUhVLIxbcMXlay0": { // サンプル1（処理とアウトプット）
        // スプレッドシート読み込み設定
        data: [{
                sheetName: "定義_処理",
                defCell: [
                    [2, 3] // [2行目、3列目]（C2セル）から行末まで
                ],
                connCell: []
            },
            {
                sheetName: "関係_処理",
                defCell: [],
                connCell: [
                    [2, 5] // [2行目、5列目]（E2セル）から行末まで
                ]
            },
            {
                sheetName: "定義_アウトプット",
                defCell: [
                    [2, 3] // [2行目、3列目]（C2セル）から行末まで
                ],
                connCell: []
            },
            {
                sheetName: "関係_処理-アウトプット",
                defCell: [],
                connCell: [
                    [2, 5] // [2行目、5列目]（E2セル）から行末まで
                ]
            }
        ],
        // d3の描画の設定
        display: {
            svgSize: 2400,
            labelFontSize: "16px"
        }
    },
    "1jhIvzGo1cF3kwhQm2zKOt-KNnuVZFt4qzhiwmDhboOw": { // サンプル2（月と曜日）
        // スプレッドシート読み込み設定
        data: [{
                sheetName: "定義",
                defCell: [
                    [2, 4] // [2行目、4列目]（D2セル）から行末まで
                ],
                connCell: []
            },
            {
                sheetName: "関係",
                defCell: [],
                connCell: [
                    [2, 5] // [2行目、5列目]（E2セル）から行末まで
                ]
            }
        ],
        // d3の描画の設定
        display: {
            svgSize: 900,
            labelFontSize: "16px"
        }
    },
    "1fzMsvBp-zfbHFeRkBeGzz0DkAY_oGntk4TIl40rOHbE": { // サンプル3（星）
        // スプレッドシート読み込み設定
        data: [{
                sheetName: "定義",
                defCell: [
                    [2, 4] // [2行目、4列目]（D2セル）から行末まで
                ],
                connCell: []
            },
            {
                sheetName: "関係",
                defCell: [],
                connCell: [
                    [2, 5] // [2行目、5列目]（E2セル）から行末まで
                ]
            }
        ],
        // d3の描画の設定
        display: {
            svgSize: 2000,
            labelFontSize: "16px"
        }
    },
    "1QA_pmbTnrTRuX0dJfYopJSTc8pjRQqJxmiH6b4oY0vM": { // サンプル4（戦闘）
        // スプレッドシート読み込み設定
        data: [{
                sheetName: "データ",
                defCell: [
                    [2, 7] // [2行目、7列目]（G2セル）から行末まで
                ],
                connCell: [
                    [2, 8] // [2行目、8列目]（H2セル）から行末まで
                ]
            }
        ],
        // d3の描画の設定
        display: {
            svgSize: 900,
            labelFontSize: "16px"
        }
    }
};




/**
 * 設定に基づいてスプレッドシートからデータ読み取り
 */
function getData(fileId) {
    var dataSpreadSheet = SpreadsheetApp.openById(fileId),
        nodes = [], links = [], linksById = [], nodeLen;

    SETTINGS[fileId].data.forEach(function(sheet) {
        var dataSheet = dataSpreadSheet.getSheetByName(sheet.sheetName);
        if (!dataSheet) {
            console.error("No such sheet. : " + sheet.sheetName);
            throw new Error("GAS設定に記載のシートがありません。");
        }

        // （整形などの処理はES6が使えるhtml側の方が良かったかも）
        sheet.defCell.forEach(function(cell) {
            var defs = dataSheet.getRange(cell[0], cell[1], dataSheet.getLastRow()).getValues();
            defs.forEach(function(jsonStr) {
                if (jsonStr[0]) {
                    nodes.push(JSON.parse(jsonStr));
                }
            });
        });

        sheet.connCell.forEach(function(cell) {
            var conns = dataSheet.getRange(cell[0], cell[1], dataSheet.getLastRow()).getValues();
            conns.forEach(function(jsonStr) {
                if (jsonStr[0]) {
                    linksById.push(JSON.parse(jsonStr));
                }
            });
        });
    });

    nodeLen = nodes.length;
    console.log("nodes.length : " + nodeLen);
    console.log("linksById.length : " + linksById.length);

    // ★IDでのリンクの表記をインデックス表記に変換
    links = linksById.map(function(l) {
        var s, t;
        for (var i = 0; i < nodeLen && (s === undefined || t === undefined); i++) {
            if (nodes[i].id === l.source) {
                s = i;
            } else if (nodes[i].id === l.target) {
                t = i;
            }
        }

        return {source: s, target: t};
    });
    console.log("links.length : " + links.length);

    return {nodes: nodes, links: links};
}

/**
 * getリクエストを受ける
 */
function doGet(e) {
    console.info("==========doGet START==========");
    console.log(e);
    console.info("User : " + Session.getActiveUser().getEmail());

    var fileId = e.parameter.file,
        html, data;

    if (!SETTINGS[fileId]) {
        console.error("No such setting. : " + fileId);
        throw new Error("パラメータがありません。もしくはGASに設定がありません。");    
    }

    data = getData(fileId);

    html = HtmlService.createTemplateFromFile("index");
    // パラメータをhtml側に引き渡す
    html.param = JSON.stringify({
        data: data,
        display: SETTINGS[fileId].display
    });

    console.info("==========doGet END==========");
    return html.evaluate();
}
