
# PaintBBS NEO
お絵描きしぃ掲示板 PaintBBS (&copy;2000-2004しぃちゃん) をhtml5化するプロジェクトです。  

作者行方不明のため、許諾は取れていません。

しぃちゃんのホームページ（Vector）  
http://hp.vector.co.jp/authors/VA016309/

**Flashやhtml5のお絵描きサイトはいっぱいあるんだけど、そうじゃないんだ。  
おじさんは昔のjavaアプレットそっくりの環境が欲しいんだ。**


1. 掲示板に投稿できるMac/Win用のアプリを開発します(中身はjavascript)

2. PaintBBSと見た目や操作性がだいたい同じになってきたら、  
管理人さんに連絡取って直接組み込んでもらうことを目指します

**……というわけで、ふたばでNEOが使えるようになりました！**

    105 名前：◆管理人 投稿日：2017/01/19(木) 02:20 del
    落書き板に組み込みました
    http://nov.2chan.net/q/futaba.htm
    調子が良ければ他のお絵かき板にも導入します

----

## 対応ブラウザ

Chrome/FireFox/Safari/Edge（最近のバージョンのみ）  
  Firefox推奨。IEはサポート対象外です  
  モバイルブラウザでも一応動くのですが、サポート対象外とします

## サンプル掲示板

サンプルとして[**NEOテスト**](http://neo.websozai.jp)をオープンしました  
動作確認にご利用ください

掲示板へのNEOの組み込み方法については、/samplebbsの下の[README.md](https://github.com/funige/neo/tree/master/samplebbs/README.md) に書きました  
不明な点があればサンプル掲示板で聞いてください


## Mac/Win用アプリについて
NEOが入っていない掲示板でも、このアプリを使えばNEOを使うことができます  
Chrome等のブラウザで描きたい掲示板を開いて、アドレスバーからURLをこのアプリにドラッグドロップしてください。

1. neo-darwin-x64.zip(Mac)または  
neo-win32-ia32.zip(Win)をダウンロードして、どこかに展開する  

2. 実行ファイル (neo.app または neo.exe) をダブルクリック


## 履歴

#### ver1.1.11 (2017/8/16)
- スポイトツールのバグ修正

#### ver1.1.10 (2017/8/11)
- <s>/samplebbs/[README.md](https://github.com/funige/neo/tree/master/samplebbs/README.md)修正。</s>
- スポイトツールの動作変更
- ベジェツールを微妙に調整
- Chromeでペンを認識しなくなることがあるので PointerEvents を使うように修正

#### ver1.1.9 (2017/7/27)
- キャンバスの端でぼかしブラシを使うと白が混じるのを修正
- ズーム時にブラシを画面外に出すと画面が点滅する不具合を修正
- カーソルのゴミが画面端に残ってしまうことがあるのを修正

#### ver1.1.8 (2017/7/10)
- EdgeとIEではまだバグが残っていることがわかったので、警告表示を復活しました  
※Edge40以上（userAgent文字列ではEdge/15と表示されます）でバグが治ったのが確認されています

#### ver1.1.6 (2017/5/23)
- Chrome58以降でふたばの画像掲示板に投稿すると失敗する問題を修正できたような気がします

#### ver1.1.5 (2017/5/10)
- Chrome58以降でふたばの画像掲示板に投稿すると失敗するようになったので警告表示を追加しました

#### ver1.1.4 (2017/3/27)
- サムネール投稿のバグ修正
- アプレットの高さが足りないときレイアウトが崩れるのを修正しました

#### ver1.1.3 (2017/3/16)
- ベジェツールの修正。オリジナルのPaintBBSに近い、ちょっと太い線にしました

#### ver1.1.2 (2017/3/8)
- 画面をズームした時にペン先がずれる問題を修正
- ベジェツールのハンドルの表示を修正

#### ver1.1 (2017/1/31)
- ブラウザがIEとEdgeの場合ふたばへの投稿に失敗するので、  
これらのブラウザで起動すると警告を表示するようにしました。


- テキスト入力ツールの不具合修正
- 保管ペンのバグ修正
- カラースライダの上でshift+クリックして値を1ずつ上下できるように修正
- その他細かいバグ修正

#### ver1.0 (2016/12/22)
- バグ修正

  だいたい終了です  
  加算逆加算は結局できませんでした  
  そのうち誰かが直してくれると期待して撤退……

![ver1.0](http://cdn-ak.f.st-hatena.com/images/fotolife/f/funige/20161221/20161221215643.png?1482325021)  

#### ver0.9 (2016/12/18)
- <s>Edge対応</s>
- <s>IE対応</s>
- バグ修正

#### ver0.8 (2016/12/13)
- ベジェ曲線
- 角取り・ぼかし
- 加算・逆加算テスト
- リロードした時にキャンバスが保存されるように修正
- Chromeでドラッグ中のカーソルがおかしくなる問題を修正

  残り時間でバグをできるだけ取ります  

#### ver0.7 (2016/12/5)
- 覆い焼き・焼き込み
- テキスト入力テスト
- サンプル掲示板設置

#### ver0.6 (2016/11/22)
- 水彩と鉛筆はどうやっても似ないのでひとまずこれで
- トーン
- 直線
- 傾け
- 四角とか楕円とか

  しんどい

#### ver0.5 (2016/11/3)
- スクロールバーをちゃんと表示するように修正
- キーボードショートカットを一部実装
- コピーツールのテスト  
- 保管ペンのテスト
![ver0.5](http://cdn-ak.f.st-hatena.com/images/fotolife/f/funige/20161103/20161103013321.png?1478104440)  
だいぶ飽きてきましたが  
年末までには何とかver1.0にしたいと思います

#### ver0.4.5 (2016/10/23)
- ブラウザ化テスト
- 画像の解像度を選んで描きはじめられるようになりました

  お絵かき本体はあんまり進んでないです
- 消し四角・レイヤー結合・上下反転・左右反転
- マウスポインタが指の形になっていたのを修正
- 消しペンにもマスクがかかるように修正

#### ver0.4 (2016/10/11)
- ウィンドウビュー
- マスク・逆マスク
- ボタンとかスライダとか実装

- カーソルをちゃんとxorで表示するように修正

#### ver0.3 (2016/10/4)
- 鉛筆・消しペン・塗り潰し
- 透明度
- 拡大した画像をスクロールできなかったのを修正
- マスクのテスト
- 外部のブラウザに飛ばずに送信画面を自分で開いてみるテスト  
 ![ver0.1](http://cdn-ak.f.st-hatena.com/images/fotolife/f/funige/20161004/20161004190655.png?1475575647)

#### ver0.2 (2016/9/28)
いろいろ中途半端なのでこのバージョンは見送ったほうがいいです

#### ver0.1 (2016/9/21)
とりあえず画像を既存の掲示板に送信するところだけ作って検証  
 ![ver0.1](http://cdn-ak.f.st-hatena.com/images/fotolife/f/funige/20160922/20160922095441.png?1474505726)

----
**質問・要望等は直接こちらへ**  
https://github.com/funige/neo/issues  

- しぃペインターとかPooとかは作りません  
- アニメーションの記録・再生には対応しません  
