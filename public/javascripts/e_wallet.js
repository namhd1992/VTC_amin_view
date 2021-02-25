var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var getDataByKeyName = function(dataArr, keyName) {
    var returnValue = null;
    $(dataArr).each(function(key, item) {
        if (keyName == item.keyName) {
            returnValue = item;
        }
    });
    return returnValue;
};

var getDataFromTable = function(tbl_class) {
    var return_data = [];
    var table_data = $("." + tbl_class + " .data_row");
    $.each(table_data, function(key, item) {
        var obj = {};
        var td_data = $(item).find("td");
        $.each(td_data, function(td_key, td_item) {
            if (td_item.className != "") {
                var return_key = td_item.className.split("data_cell_")[1];
                obj[return_key] = $(td_item).html();
            }
        });
        return_data.push(obj);
    });
    return return_data;
};

var compare_transfer_item = function(a, b) {
    if (parseInt(a.from) < parseInt(b.from))
        return -1;
    if (parseInt(a.from) > parseInt(b.from))
        return 1;
    return 0;
}

var compare_deposit_item = function(a, b) {
    if (parseInt(a.scoin) < parseInt(b.scoin))
        return -1;
    if (parseInt(a.scoin) > parseInt(b.scoin))
        return 1;
    return 0;
}

var reload_form = function() {
    $.ajax({
        url: base_request_url + "/admin/walletConfig",
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            if (data.onlyMessage == 'Success') {
                console.log(data);

                // checkbox deposit
                if (getDataByKeyName(data.dataArr, "deposit").value == "enabled") {
                    $($(".cb_deposit").parent()[0]).addClass("checked");
                    $(".cb_deposit").attr("checked", "checked");
                    $(".cb_deposit_text").html("Enabled");
                    $(".cb_deposit").parent().parent().parent()[0].className = "lb_cb_active";
                } else if (getDataByKeyName(data.dataArr, "deposit").value == "disabled") {
                    $($(".cb_deposit").parent()[0]).removeClass("checked");
                    $(".cb_deposit").attr("checked", "");
                    $(".cb_deposit_text").html("Disabled");
                    $(".cb_deposit").parent().parent().parent()[0].className = "lb_cb_deactive";
                }

                // checkbox transfer
                if (getDataByKeyName(data.dataArr, "money transfer").value == "enabled") {
                    $($(".cb_transfer").parent()[0]).addClass("checked");
                    $(".cb_transfer").attr("checked", "checked");
                    $(".cb_transfer_text").html("Enabled");
                    $(".cb_transfer").parent().parent().parent()[0].className = "lb_cb_active";
                } else if (getDataByKeyName(data.dataArr, "money transfer").value == "disabled") {
                    $($(".cb_transfer").parent()[0]).removeClass("checked");
                    $(".cb_transfer").attr("checked", "");
                    $(".cb_transfer_text").html("Disabled");
                    $(".cb_transfer").parent().parent().parent()[0].className = "lb_cb_deactive";
                }

                // transfer general settings
                $(".txt_max_transfer_day").val(getDataByKeyName(data.dataArr, "max transaction transfer per day").value);
                $(".txt_max_coin_day").val(getDataByKeyName(data.dataArr, "max balance transfer per day").value);
                $(".txt_max_coin_time").val(getDataByKeyName(data.dataArr, "max balance transfer per transaction").value);
                $(".txt_max_fail_day").val(getDataByKeyName(data.dataArr, "max fail transfer per day").value);
                $(".txt_time_between").val(getDataByKeyName(data.dataArr, "time between two transaction").value);

                //transfer fee table
                $(".data_row").remove();
                var transfer_fee = JSON.parse(getDataByKeyName(data.dataArr, "transfer fee").value);
                $.each(transfer_fee, function(key, item) {
                    $(".table_transfer_fee .input_row").before("<tr class='data_row'><td class='data_cell_from'>" + item.from + "</td><td class='data_cell_to'>" + item.to + "</td><td class='data_cell_feePercent'>" + item.feePercent + "</td><td class='data_cell_minFee'>" + item.minFee + "</td><td><div class='btn btn-link btn_transfer_fee_remove'>Remove</div><div class='btn btn-link btn_transfer_fee_edit'>Edit</div><div class='btn btn-link btn_transfer_fee_update' style='display:none;'>Save</div></td></tr>");
                    $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_remove").click(function() {
                        $(this).parent().parent().remove();
                    });
                    $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_edit").click(function() {
                        var td_list = $(this).parent().parent().find("td");
                        $.each(td_list, function(key, item) {
                            if (item.className != "") {
                                var temp_content = $(item).html();
                                $(item).html("<input type='number' value='" + temp_content + "' />");
                            }
                        });
                        $(this).parent().find(".btn_transfer_fee_update").show();
                        $(this).hide();
                    });
                    $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_update").click(function() {
                        var from_value = $($(this).parent().parent().find("td.data_cell_from input")[0]).val();
                        var to_value = $($(this).parent().parent().find("td.data_cell_to input")[0]).val();
                        if (from_value > to_value) {
                            show_toast_notif("error", "Error", "'From' value cant bigger than 'to' value", function() {

                            });
                            return;
                        }
                        var td_list = $(this).parent().parent().find("td");
                        $.each(td_list, function(key, item) {
                            if (item.className != "") {
                                var temp_content = $($(item).find("input")[0]).val();
                                $(item).html(temp_content);
                            }
                        });
                        $(this).parent().find(".btn_transfer_fee_edit").show();
                        $(this).hide();
                    });
                });
                var deposit_setting = JSON.parse(getDataByKeyName(data.dataArr, "deposit setting").value);
                $.each(deposit_setting, function(key, item) {
                    $(".table_deposit .input_row").before("<tr class='data_row'><td class='data_cell_scoin'>" + item.scoin + "</td><td class='data_cell_leagueBalance'>" + item.leagueBalance + "</td><td><div class='btn btn-link btn_deposit_remove'>remove</div><div class='btn btn-link btn_deposit_edit'>Edit</div><div class='btn btn-link btn_deposit_update' style='display:none;'>Save</div></td></tr>");
                    $(".table_deposit .input_row").prev().find(".btn_deposit_remove").click(function() {
                        $(this).parent().parent().remove();
                    });
                    $(".table_deposit .input_row").prev().find(".btn_deposit_edit").click(function() {
                        var td_list = $(this).parent().parent().find("td");
                        $.each(td_list, function(key, item) {
                            if (item.className != "") {
                                var temp_content = $(item).html();
                                $(item).html("<input type='number' value='" + temp_content + "' />");
                            }
                        });
                        $(this).parent().find(".btn_deposit_update").show();
                        $(this).hide();
                    });
                    $(".table_deposit .input_row").prev().find(".btn_deposit_update").click(function() {
                        var td_list = $(this).parent().parent().find("td");
                        $.each(td_list, function(key, item) {
                            if (item.className != "") {
                                var temp_content = $($(item).find("input")[0]).val();
                                $(item).html(temp_content);
                            }
                        });
                        $(this).parent().find(".btn_deposit_edit").show();
                        $(this).hide();
                    });
                });
            } else {
                show_toast_notif("error", "Error", "Fail to load wallet config informations", function() {

                });
            }
        },
        error: function(error) {
            show_toast_notif("error", "Error", "Error message '" + error.responseText + "'", function() {

            });
        },
    });
}

var load_page = function() {
    reload_form();

    //onload event
    $(":checkbox").on("click", function() {
        $(this).parent().nextAll("select").prop("disabled", !this.checked);
        console.log(this);

        // deposit checkbox event
        if ($(this).attr("class") == "cb_deposit") {
            if ($(this).parent().attr("class") == "checked") {
                $(this).parent().parent().parent()[0].className = "lb_cb_active";
                $($(this).parent().parent().parent()[0]).find(".cb_deposit_text").html("Enabled");
            } else {
                $(this).parent().parent().parent()[0].className = "lb_cb_deactive";
                $($(this).parent().parent().parent()[0]).find(".cb_deposit_text").html("Disabled");
            }
        }
        // transfer checkbox event
        if ($(this).attr("class") == "cb_transfer") {
            if ($(this).parent().attr("class") == "checked") {
                $(this).parent().parent().parent()[0].className = "lb_cb_active";
                $($(this).parent().parent().parent()[0]).find(".cb_transfer_text").html("Enabled");
            } else {
                $(this).parent().parent().parent()[0].className = "lb_cb_deactive";
                $($(this).parent().parent().parent()[0]).find(".cb_transfer_text").html("Disabled");
            }
        }
    });

    $(".btn_transfer_add").on("click", function() {
        var from_value = $($(".txt_transfer_fee_from")[0]).val();
        var to_value = $($(".txt_transfer_fee_to")[0]).val();
        var percent_value = $($(".txt_transfer_fee_percent")[0]).val();
        var min_value = $($(".txt_transfer_fee_min")[0]).val();
        if (from_value > to_value) {
            show_toast_notif("error", "Error", "'From' value cant bigger than 'to' value", function() {

            });
            return;
        }
        $(".table_transfer_fee .input_row").before("<tr class='data_row'><td class='data_cell_from'>" + from_value + "</td><td class='data_cell_to'>" + to_value + "</td><td class='data_cell_feePercent'>" + percent_value + "</td><td class='data_cell_minFee'>" + min_value + "</td><td><div class='btn btn-link btn_transfer_fee_remove'>remove</div><div class='btn btn-link btn_transfer_fee_edit'>Edit</div><div class='btn btn-link btn_transfer_fee_update' style='display:none;'>Save</div></td></tr>");
        $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_remove").click(function() {
            $(this).parent().parent().remove();
        });
        $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_edit").click(function() {
            var td_list = $(this).parent().parent().find("td");
            $.each(td_list, function(key, item) {
                if (item.className != "") {
                    var temp_content = $(item).html();
                    $(item).html("<input type='number' value='" + temp_content + "' />");
                }
            });
            $(this).parent().find(".btn_transfer_fee_update").show();
            $(this).hide();
        });
        $(".table_transfer_fee .input_row").prev().find(".btn_transfer_fee_update").click(function() {
            var td_list = $(this).parent().parent().find("td");
            var from_value = $($(this).parent().parent().find("td.data_cell_from")[0]).val();
            var to_value = $($(this).parent().parent().find("td.data_cell_to")[0]).val();
            console.log(from_value + "-" + to_value);
            if (from_value > to_value) {
                show_toast_notif("error", "Error", "'From' value cant bigger than 'to' value", function() {

                });
                return;
            }
            $.each(td_list, function(key, item) {
                if (item.className != "") {
                    var temp_content = $($(item).find("input")[0]).val();
                    $(item).html(temp_content);
                }
            });
            $(this).parent().find(".btn_transfer_fee_edit").show();
            $(this).hide();
        });
        $($(".txt_transfer_fee_from")[0]).val(0);
        $($(".txt_transfer_fee_to")[0]).val(0);
        $($(".txt_transfer_fee_percent")[0]).val(0);
        $($(".txt_transfer_fee_min")[0]).val(0);
    });

    $(".btn_deposit_add").on("click", function() {
        var coin_value = parseInt($($(".txt_deposit_coin")[0]).val());
        var price_value = parseInt($($(".txt_deposit_price")[0]).val());
        var error = false;
        $(".data_cell_leagueBalance").each(function(key, item) {
            if (parseInt($(item).html()) == price_value) {
                show_toast_notif("error", "Error", "League Point value is already exist", function() {});
                error = true;
            }
        });
        $(".data_cell_scoin").each(function(key, item) {
            if (parseInt($(item).html()) == coin_value) {
                show_toast_notif("error", "Error", "S-Coin value is already exist", function() {});
                error = true;
            }
        });
        if (error) {
            return;
        }
        $(".table_deposit .input_row").before("<tr class='data_row'><td class='data_cell_leagueBalance'>" + coin_value + "</td><td class='data_cell_scoin'>" + price_value + "</td><td><div class='btn btn-link btn_deposit_remove'>remove</div><div class='btn btn-link btn_deposit_edit'>Edit</div><div class='btn btn-link btn_deposit_update' style='display:none;'>Save</div></td></tr>");
        $(".table_deposit .input_row").prev().find(".btn_deposit_remove").click(function() {
            $(this).parent().parent().remove();
        });
        $(".table_deposit .input_row").prev().find(".btn_deposit_edit").click(function() {
            var td_list = $(this).parent().parent().find("td");
            $.each(td_list, function(key, item) {
                if (item.className != "") {
                    var temp_content = $(item).html();
                    $(item).html("<input type='number' value='" + temp_content + "' />");
                }
            });
            $(this).parent().find(".btn_deposit_update").show();
            $(this).hide();
        });
        $(".table_deposit .input_row").prev().find(".btn_deposit_update").click(function() {
            var td_list = $(this).parent().parent().find("td");
            $.each(td_list, function(key, item) {
                if (item.className != "") {
                    var temp_content = $($(item).find("input")[0]).val();
                    $(item).html(temp_content);
                }
            });
            $(this).parent().find(".btn_deposit_edit").show();
            $(this).hide();
        });
        $($(".txt_deposit_coin")[0]).val(0);
        $($(".txt_deposit_price")[0]).val(0);
    });

    $(".btn_save_setting").click(function() {
        var is_editing = false;
        $(".btn_transfer_fee_edit").each(function(key, item) {
            if ($(item).css('display') == 'none') {
                is_editing = true;
            }
        });
        $(".btn_deposit_edit").each(function(key, item) {
            if ($(item).css('display') == 'none') {
                is_editing = true;
            }
        });
        if (is_editing) {
            show_toast_notif("error", "Error", "Please finish your update in the transfer fee table and deposit settings before save", function() {});
            return;
        }
        var deposit_function = "disabled";
        if ($(".cb_deposit").parent()[0].className == "checked") {
            deposit_function = "enabled";
        }
        var transfer_function = "disabled";
        if ($(".cb_transfer").parent()[0].className == "checked") {
            transfer_function = "enabled";
        }
        var max_transfer_day = $(".txt_max_transfer_day").val();
        var max_coin_day = $(".txt_max_coin_day").val();
        var max_coin_time = $(".txt_max_coin_time").val();
        var max_fail_day = $(".txt_max_fail_day").val();
        var time_between = $(".txt_time_between").val();
        var transfer_fee_tbl_data = getDataFromTable("table_transfer_fee");
        var deposit_tbl_data = getDataFromTable("table_deposit");
        transfer_fee_tbl_data.sort(compare_transfer_item);
        deposit_tbl_data.sort(compare_deposit_item);
        var json_params = [{
            "id": 1,
            "value": deposit_function,
        }, {
            "id": 2,
            "value": transfer_function,
        }, {
            "id": 3,
            "value": max_transfer_day,
        }, {
            "id": 4,
            "value": max_coin_day,
        }, {
            "id": 5,
            "value": max_coin_time,
        }, {
            "id": 6,
            "value": max_fail_day,
        }, {
            "id": 7,
            "value": time_between,
        }, {
            "id": 8,
            "value": JSON.stringify(transfer_fee_tbl_data),
        }, {
            "id": 9,
            "value": JSON.stringify(deposit_tbl_data),
        }];
        $.ajax({
            url: base_request_url + "/admin/walletConfig",
            type: "PUT",
            data: JSON.stringify(json_params),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    reload_form();
                    show_toast_notif("success", "Updated", "e-Wallet settings updated", function() {

                    });
                } else {
                    show_toast_notif("error", "Error", "Fail to update wallet config informations", function() {

                    });
                }
            },
            error: function(error) {
                show_toast_notif("error", "Error", "Error message '" + error.responseText + "'", function() {

                });
            },
        });
    });
};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();
});