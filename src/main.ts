import './style.css'; // CSSファイルのimport
// MapLibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

import shelterPointData from './shelter_point.json'; // 避難所データの読み込み

// 地図の表示
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
            pales: {
                // ソースの定義
                type: 'raster', // データタイプはラスターを指定
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'], // タイルのURL
                tileSize: 256, // タイルのサイズ
                maxzoom: 18, // 最大ズームレベル
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>", // 地図上に表示される属性テキスト
            },
            seamlessphoto: {
                // 全国最新写真
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                tileSize: 256,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
                maxzoom: 18,
            },
            slopemap: {
                // 傾斜量図
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/slopemap/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
                maxzoom: 15,
            },
            flood: {
                // 洪水浸水想定区域（想定最大規模）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            hightide: {
                // 高潮浸水想定区域
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            tsunami: {
                // 津波浸水想定
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            shelter: {
                type: 'geojson', // データタイプはgeojsonを指定
                data: shelterPointData,
                attribution: '<a href="https://www.bousai.metro.tokyo.lg.jp/bousai/1000026/1000316.html" target="_blank">東京都避難所、避難場所データ オープンデータ</a>',
                cluster: true, // クラスタリングの有効化
                clusterMaxZoom: 12, // クラスタリングを開始するズームレベル
                clusterRadius: 50, // クラスタリングの半径
            },
        },
        layers: [
            {
                id: 'pales_layer', // レイヤーのID
                source: 'pales', // ソースのID
                type: 'raster', // データタイプはラスターを指定
            },
            // 全国最新写真と傾斜量図のレイヤーを表示
            {
                id: 'seamlessphoto_layer',
                source: 'seamlessphoto',
                type: 'raster',
            },
            {
                id: 'slopemap_layer',
                source: 'slopemap',
                type: 'raster',
            },
            {
                id: 'background', // マスクレイヤー
                type: 'background',
                paint: {
                    'background-color': '#000', // レイヤーの色を設定
                    'background-opacity': 0.3, // 不透明度を設定
                },
            },
            {
                id: 'flood_layer', // 洪水浸水想定区域（想定最大規模）
                source: 'flood',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'hightide_layer', // 高潮浸水想定区域
                source: 'hightide',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'tsunami_layer', // 津波浸水想定
                source: 'tsunami',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'clusters', // クラスター
                source: 'shelter',
                type: 'circle',
                filter: ['has', 'point_count'], // クラスターに含まれるポイントのみ表示
                paint: {
                    'circle-color': '#0BB1AF', // クラスターの色
                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40], // クラスターのポイント数に応じてサイズを変更
                    'circle-blur': 0.3, // クラスターのぼかし
                },
            },
            {
                id: 'cluster-count', // クラスターのポイントの数
                source: 'shelter',
                type: 'symbol',
                filter: ['has', 'point_count'], // クラスターに含まれるポイントのみ表示
                layout: {
                    'text-field': '{point_count_abbreviated}', // クラスターのポイント数を表示
                    'text-size': 12, // テキストのサイズ
                },
                paint: {
                    'text-color': '#FFF',
                },
            },
            {
                id: 'shelter_point',
                source: 'shelter',
                type: 'circle', // ポイントデータを表示するためにcircleを指定
                filter: ['!', ['has', 'point_count']], // クラスターに含まれないポイントのみ表示
                paint: {
                    'circle-color': '#0BB1AF', // ポイントの色
                    'circle-radius': 8, // ポイントのサイズ
                    'circle-stroke-width': 2, // ポイントの枠線の太さ
                    'circle-stroke-color': '#FFF', // ポイントの枠線の色
                },
            },
        ],
    },
    center: [139.477, 35.681], // 地図の中心座標
    zoom: 9, // 地図の初期ズームレベル
});

// マップの初期ロード完了時に発火するイベント
map.on('load', () => {
    // 背景地図の切り替えコントロール
    const baseMaps = new OpacityControl({
        baseLayers: {
            // コントロールに表示するレイヤーの定義
            pales_layer: '淡色地図',
            seamlessphoto_layer: '空中写真',
            slopemap_layer: '傾斜量図',
        },
    });
    map.addControl(baseMaps, 'top-left'); // 第二引数でUIの表示場所を定義

    // 災害情報レイヤーの切り替えコントロール
    const hazardLayers = new OpacityControl({
        baseLayers: {
            flood_layer: '洪水浸水想定区域',
            hightide_layer: '高潮浸水想定区域',
            tsunami_layer: '津波浸水想定',
        },
    });
    map.addControl(hazardLayers, 'top-left');
});
