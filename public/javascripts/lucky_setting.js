//page variable
var editing_item = null;
var item_name = "Event";
var item_names = "Events";
var deleted_id = null;
var filter_name = null;
var filter_match = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var setting_data = null;
var search_value = null;
var profit = null;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var reload_data = function(callback) {
    $(".loading_icon").show();
    _send_info.data = {
        "limit": 10000,
        "offset": 0
    };
    $.ajax({
        url: base_request_url + "/admin/luckyspinSetting",
        type: "GET",
        data: _send_info.data,
        contentType: "application/json",
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            callback(data);
            $(".loading_icon").hide();
        },
        error: function(err) {
            console.log(err.error());
        }
    });
}

var load_page = function() {

    reload_data(function(data) {
        console.log(data);
        $(".txt_jackpot_pool").val(get_data_by_name(data.dataArr, "jackpot").intValue);
        $(".txt_jackpot_min").val(get_data_by_name(data.dataArr, "jackpot_min").intValue);
        $(".txt_turn_small").val(get_data_by_name(data.dataArr, "turn_small").intValue);
        $(".txt_turn_medium").val(get_data_by_name(data.dataArr, "turn_medium").intValue);
        $(".txt_turn_big").val(get_data_by_name(data.dataArr, "turn_big").intValue);
        $(".txt_lucky_role").val(get_data_by_name(data.dataArr, "luckyRole").stringValue);
        $(".txt_jackpot_ratio").val((get_data_by_name(data.dataArr, "jackpot").doubleValue) * 100);
    });
    $('.btn_submit').click(function() {
        _send_info.data = {
            "dataRequest": [{
                "id": 1,
                "intValue": $(".txt_turn_small").val(),
            }, {
                "id": 2,
                "intValue": $(".txt_turn_medium").val(),
            }, {
                "id": 3,
                "intValue": $(".txt_turn_big").val(),
            }, {
                "id": 4,
                "doubleValue": $(".txt_jackpot_ratio").val() / 100,
            }, {
                "id": 5,
                "intValue": $(".txt_jackpot_min").val(),
            }, {
                "id": 6,
                "stringValue": $(".txt_lucky_role").val(),
            }]
        };
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/luckyspinSetting",
            type: "PUT",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    reload_data(function(data) {
                        $(".txt_jackpot_pool").val(get_data_by_name(data.dataArr, "jackpot").intValue);
                        $(".txt_jackpot_min").val(get_data_by_name(data.dataArr, "jackpot_min").intValue);
                        $(".txt_turn_small").val(get_data_by_name(data.dataArr, "turn_small").intValue);
                        $(".txt_turn_medium").val(get_data_by_name(data.dataArr, "turn_medium").intValue);
                        $(".txt_turn_big").val(get_data_by_name(data.dataArr, "turn_big").intValue);
                        $(".txt_jackpot_ratio").val((get_data_by_name(data.dataArr, "jackpot").doubleValue) * 100);
                    });
                    show_toast_notif("success", "Successfully", "Updated lucky spin setting");
                } else {
                    show_toast_notif("error", "Fail", data.onlyMessage);
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
                $(".loading_icon").hide();
            },
        });
    });

};

function get_data_by_name(dataArr, name) {
    var result_item = null;
    $(dataArr).each(function(key, item) {
        if (item.name == name) {
            result_item = item;
        }
    });
    return result_item;
}

$(document).ready(function() {
    Page_script.init();
    load_page();
});