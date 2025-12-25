(function executeRule(current, previous /*null when async*/ ) {

    try {
        // 1. REST Messageの呼び出し
        // スコープ名を含めたフルネームで指定（正しい記述です）
        var r = new sn_ws.RESTMessageV2('x_snc_hello_001.Public Test API2', 'Default GET');

        var response = r.execute();
        var responseBody = response.getBody();
        var httpStatus = response.getStatusCode();

        // ログ出力（デバッグ用：値が取れない時に原因がすぐわかります）
        gs.debug("REST Response: " + responseBody);

        /* 生データを入れる場合
        current.subject = responseBody;
		current.update();
		*/

		//生データを整形してフィールドにセット
        if (httpStatus == 200 && !gs.nil(responseBody)) {
            // 2. JSONをパース
            var parsedData = JSON.parse(responseBody);

            // ★Open-Meteo API（天気）用にパスを修正★
            // 気温を取得する場合：parsedData.current.temperature_2m
            // 以前のAPI（JSONPlaceholder）なら parsedData.title のままでOK
            var apiValue = parsedData.current ? parsedData.current.temperature_2m : parsedData.title;

            if (!gs.nil(apiValue)) {
                // 3. 現在のレコードのフィールドにセット
                // 文字列としてセットするために String() でキャストしておくとより安全です
                current.subject = "現在の気温: " + String(apiValue) + "℃";

                // 4. Asyncのため update() を実行
                current.setWorkflow(false); // 無限ループ防止
                current.update();

                gs.info("APIからの書き込み完了。取得値: " + apiValue);
            }
        } else {
            gs.warn("API連携失敗。Status: " + httpStatus);
        }
    } catch (ex) {
        gs.error("REST連携システムエラー: " + ex.message);
    }

})(current, previous);
