//page variable
var editing_item = null;
var item_name = "Deposit History";
var item_names = "Users";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
var search_value = null;
var start_time = null;
var end_time = null;
var from_amount = null;
var to_amount = null;
var sender = null;
var receiver = null;
var doneTypingInterval = 500;
var searching_value_timeout = "";
var typingTimer;
var order_by = null;
_current_page = 1;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var str_pad = function(n) {
    return String("00" + n).slice(-2);
}

var reload_widget = function() {
    var params = {};
    params.filterBy = {
        "serviceType": "transfer"
    };
    params.filterBy.createOn = {};
    params.filterBy.amount = {};
    params.limit = _per_page;
    params.offset = _per_page * (_current_page - 1);
    if (search_value != null) {
        params.searchValue = search_value;
    }
    if (start_time != null && start_time != "") {
        params.filterBy.createOn.fromDate = new Date(start_time).getTime();
    }
    if (end_time != null && end_time != "") {
        params.filterBy.createOn.toDate = new Date(end_time).getTime() + 86400000;
    }
    if (params.filterBy.createOn == {}) {
        params.filterBy.createOn = null;
    }
    if (from_amount != null && from_amount != "") {
        params.filterBy.amount.fromAmount = from_amount;
    }
    if (to_amount != null && to_amount != "") {
        params.filterBy.amount.toAmount = to_amount;
    }
    if (params.filterBy.amount == {}) {
        params.filterBy.amount = null;
    }
    if (sender != null) {
        params.filterBy.senderId = sender;
    }
    if (receiver != null) {
        params.filterBy.receiverId = receiver;
    }
    if (order_by != null && order_by != "") {
        var order_by_obj = JSON.parse(order_by);
        if (order_by_obj == {}) {
            order_by_obj = null;
        }
        params.sortBy = order_by_obj;
    }
    $.ajax({
        url: base_request_url + "/admin/sumTransactionHistory",
        type: "POST",
        data: JSON.stringify(params),
        contentType: "application/json",
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            $(".widget_total_amount").attr("data-value", data.data.amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '1,'));
            $(".widget_total_fee").attr("data-value", data.data.fee.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '1,'));
            $(".widget_total_final_amount").attr("data-value", data.data.totalAmount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '1,'));
            $(".widget_total_times").attr("data-value", data.data.times);
            $(".widget_total_amount").counterUp();
            $(".widget_total_fee").counterUp();
            $(".widget_total_final_amount").counterUp();
            $(".widget_total_times").counterUp();
        },
        error: function(err) {
            console.log("error");
            console.log(err.error());
        }
    });
}

var load_autocomplete_component = function() {

    $.fn.select2.defaults.set("theme", "bootstrap");
    var placeholder = "Type to search";

    $(".select2").select2({
        placeholder: placeholder,
        width: null
    });

    $("button[data-select2-open]").click(function() {
        $("#" + $(this).data("select2-open")).select2("open");
    });

    $(".js-btn-set-scaling-classes").on("click", function() {
        $("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
        $("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
        $(this).removeClass("btn-primary btn-outline").prop("disabled", true);
    });
};

var load_page = function() {
    $(".loading_icon").show();
    _send_info.data = {
        "limit": _per_page,
        "offset": 0,
    };

    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });

    reload_widget();

    page_datatable = $('#page_datatable').DataTable({
        "ajax": {
            "url": base_request_url + "/admin/getTransactionHistory",
            "type": "POST",
            "data": function(d) {
                d.filterBy = {
                    "serviceType": "transfer"
                };
                d.filterBy.createOn = {};
                d.filterBy.amount = {};
                d.limit = _per_page;
                d.offset = _per_page * (_current_page - 1);
                if (search_value != null) {
                    d.searchValue = search_value;
                }
                if (start_time != null && start_time != "") {
                    d.filterBy.createOn.fromDate = new Date(start_time).getTime();
                }
                if (end_time != null && end_time != "") {
                    d.filterBy.createOn.toDate = new Date(end_time).getTime() + 86400000;
                }
                if (d.filterBy.createOn == {}) {
                    d.filterBy.createOn = null;
                }
                if (from_amount != null && start_time != "") {
                    d.filterBy.amount.fromAmount = from_amount;
                }
                if (to_amount != null && to_amount != "") {
                    d.filterBy.amount.toAmount = to_amount;
                }
                if (d.filterBy.amount == {}) {
                    d.filterBy.amount = null;
                }
                if (sender != null) {
                    d.filterBy.senderId = sender;
                }
                if (receiver != null) {
                    d.filterBy.receiverId = receiver;
                }
                if (order_by != null && order_by != "") {
                    var order_by_obj = JSON.parse(order_by);
                    if (order_by_obj == {}) {
                        order_by_obj = null;
                    }
                    d.sortBy = order_by_obj;
                }
                return JSON.stringify(d);
            },
            "contentType": "application/json",
            "dataType": "json",
            "dataSrc": function(json) {
                console.log(json);
                var i = 0;
                $(".datatable_paging").html("");
                if (json.totalRecords > _per_page) {
                    for (i = 1; i <= Math.ceil(json.totalRecords / _per_page); i++) {
                        if (i == _current_page) {
                            $(".datatable_paging").append("<span class='datatable_paging_number_active' page=" + i + ">" + i + "</span>");
                        } else {
                            if (i == 1 || i == Math.ceil(json.totalRecords / _per_page) || i == (_current_page - 1) || i == (_current_page - 2) || i == (_current_page + 2) || i == (_current_page + 1)) {
                                if (i == 1 && _current_page > 4) {
                                    $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                    $($(".datatable_paging_number")[0]).after("<span class='paging_truncate'>...</span>");
                                } else if (i == Math.ceil(json.totalRecords / _per_page) && _current_page < (Math.ceil(json.totalRecords / _per_page) - 3)) {
                                    $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                    $($(".datatable_paging_number")[$(".datatable_paging_number").length - 1]).before("<span class='paging_truncate'>...</span>");
                                } else {
                                    $(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
                                }
                            }
                        }
                    }
                } else {
                    $(".datatable_paging").html("<span class='datatable_paging_number_active' page=" + 1 + ">" + 1 + "</span>");
                }
                $(".datatable_paging_number").click(function(e) {
                    _current_page = parseInt($(e.target).attr("page"));
                    page_datatable.ajax.reload();
                });
                $(".loading_icon").hide();
                return json.dataArr;
            },
            "beforeSend": function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            "error": function(xhr, error, thrown) {
                if (JSON.parse(xhr.responseText).error == "invalid_token") {
                    localStorage.removeItem("user_data");
                    document.location.replace("login");
                }
            },
        },
        "columns": [
            { title: "ID", data: "id" },
            { title: "Sender", data: "sender.username" },
            { title: "Receiver", data: "receiver.username" },
            { title: "Amount", data: "amount" },
            { title: "Fee", data: "fee" },
            { title: "Total Amount", data: "totalAmount" },
            {
                title: "Date",
                data: null,
                render: function(data, type, full, meta) {
                    var format = getSetting(_setting_data, "date_format");
                    var news_date = moment.unix(full.createOn / 1000).format(format.value);
                    return news_date;
                }
            },
            {
                title: "Actions",
                data: null,
                render: function(data, type, full, meta) {
                    var string_result = "";
                    string_result = "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "' ><i class='icon-question'></i> Info </a>";
                    return string_result;
                }
            },
        ],
        "aoColumnDefs": [
            { "sWidth": "5%", 'aTargets': [0] },
            { "sWidth": "10%", 'aTargets': [1] },
            { "sWidth": "10%", 'aTargets': [2] },
            { "sWidth": "10%", 'aTargets': [3] },
            { "sWidth": "10%", 'aTargets': [4] },
            { "sWidth": "10%", 'aTargets': [5] },
            { "sWidth": "20%", 'aTargets': [6] },
            { "sWidth": "10%", 'aTargets': [7] },
        ],
        "autoWidth": false,
        "lengthChange": false,
        "info": false,
        "bSort": false,
        "bPaginate": false,
        "bFilter": false,
        "fnDrawCallback": function(oSettings) {
            $("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function() {
                return this.nodeType != 1;
            }).replaceWith("");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("form-control");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-inline");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-medium");
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("placeholder", 'Search...');
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("id", 'inputSuccess');

            // event for all component inside datatable
            $(".btn_edit_item").click(function() {
                var obj_temp = JSON.parse($(this).attr("item_obj"));
                $('.info_sender').html(obj_temp.sender.username);
                $('.info_receiver').html(obj_temp.receiver.username);
                $('.info_amount_after').html(obj_temp.balanceAfter);
                $('.info_amount_before').html(obj_temp.balanceBefore);
                $('.info_status').html(obj_temp.status);
                $('#modal_add_edit').modal('show');
            });
            $('.btn_delete_item').click(function() {
                deleted_id = parseInt($(this).attr("item_id"));
                $("#modal_confirm").modal("show");
            });
        },
    });

    $.ajax({
        url: base_request_url + "/admin/user",
        type: "GET",
        data: {
            limit: 10,
            offset: 0
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            $(data.dataArr).each(function(key, item) {
                $("#single_select_user").append("<option value='" + item.id + "'> " + item.username + "</option>");
                $("#single_select_receiver").append("<option value='" + item.id + "'> " + item.username + "</option>");
            });
            load_autocomplete_component();
        },
        error: function(err) {
            console.log(err.error());
        }
    });

    $('.date-picker').datepicker({
        rtl: App.isRTL(),
        orientation: "left",
        autoclose: true
    });

    $(".btn_add_new_item").click(function() {
        $('#modal_add_edit .modal-title').html("Create new " + item_name);
        $('#modal_add_edit input:text').val("");
        $(".txt_add_edit_item_channel").attr("name", "channelId");
        channel_arr = [];
        $('.current_channels').html("");
        $('#modal_add_edit .btn_modal_save_new').show();
        $('#modal_add_edit .btn_modal_save_update').hide();
        $("#modal_add_edit").modal("show");
    });

    $(".search_submit").click(function() {
        sender = parseInt($("#single_select_user").val());
        receiver = parseInt($("#single_select_receiver").val());
        start_time = $(".txt_add_edit_item_dateStart").val();
        end_time = $(".txt_add_edit_item_dateEnd").val();
        from_amount = $(".txt_add_edit_item_from_amount").val();
        to_amount = $(".txt_add_edit_item_to_amount").val();
        order_by = $("#single_select_order_by").val();
        reload_widget();
        page_datatable.ajax.reload(null, false);
    });
    $(".search_clear").click(function() {
        $("#single_select_user").val("");
        $("#single_select_receiver").val("");
        $(".txt_add_edit_item_dateStart").val("");
        $(".txt_add_edit_item_dateEnd").val("");
        $(".txt_add_edit_item_from_amount").val("");
        $(".txt_add_edit_item_to_amount").val("");
        $("#single_select_order_by").val("");
        load_autocomplete_component();
        sender = null;
        receiver = null;
        start_time = null;
        end_time = null;
        from_amount = null;
        to_amount = null;
        order_by = null;
        reload_widget();
        page_datatable.ajax.reload(null, false);
    });

    $(".select2").on("select2:open", function() {
        if ($(this).parents("[class*='has-']").length) {
            var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);

            for (var i = 0; i < classNames.length; ++i) {
                if (classNames[i].match("has-")) {
                    $("body > .select2-container").addClass(classNames[i]);
                }
            }
        }
        if ($(this).attr("id") == "single_select_user") {
            //event for search field
            typing_input = $('.select2-search__field')[0];
            $(typing_input).on("keypress", function() {
                console.log("press single");
                $(".select2-results__option").html("Searching");
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function() {
                    //ajax get all tags
                    _send_info.data = {
                        "limit": 10,
                        "offset": 0,
                        "searchValue": $(typing_input).val()
                    };
                    searching_value_timeout = $(typing_input).val();
                    $("#single_select_user").html("");
                    $.ajax({
                        url: base_request_url + "/admin/user",
                        type: "GET",
                        data: _send_info.data,
                        contentType: "application/json",
                        dataType: "json",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                        },
                        success: function(data) {
                            console.log("success");
                            var tags_arr = [];
                            $(data.dataArr).each(function(key, item) {
                                $("#single_select_user").append("<option value='" + item.id + "'> " + item.username + "</option>");
                            });
                            load_autocomplete_component();
                            $("#single_select_user").select2("open");
                            $($('.select2-search__field')[0]).val(searching_value_timeout);
                        },
                        error: function(err) {
                            console.log("error");
                            console.log(err.error());
                        }
                    });
                }, doneTypingInterval);
            });
        }
        if ($(this).attr("id") == "single_select_receiver") {
            //event for search field
            typing_input = $('.select2-search__field')[0];
            $(typing_input).on("keypress", function() {
                console.log("press");
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function() {
                    //ajax get all tags
                    _send_info.data = {
                        "limit": 10,
                        "offset": 0,
                        "searchValue": $(typing_input).val()
                    };
                    searching_value_timeout = $(typing_input).val();
                    $("#single_select_receiver").html("");
                    $.ajax({
                        url: base_request_url + "/admin/user",
                        type: "GET",
                        data: _send_info.data,
                        contentType: "application/json",
                        dataType: "json",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                        },
                        success: function(data) {
                            console.log("success");
                            var tags_arr = [];
                            $(data.dataArr).each(function(key, item) {
                                $("#single_select_receiver").append("<option value='" + item.id + "'> " + item.username + "</option>");
                            });
                            load_autocomplete_component();
                            $("#single_select_receiver").select2("open");
                            $($('.select2-search__field')[0]).val(searching_value_timeout);
                        },
                        error: function(err) {
                            console.log("error");
                            console.log(err.error());
                        }
                    });
                }, doneTypingInterval);
            });
        }

    });

};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();
});