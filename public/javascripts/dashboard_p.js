var _current_page = 1;
_per_page = 5;
var search_value = "";
var search_start = "";
var search_end = "";
var search_report_type = 1;
$(document).ready(function() {
    var initpage = function() {
        $('#defaultrange').daterangepicker({
                opens: (App.isRTL() ? 'left' : 'right'),
                format: "YYYY-MMMM-D HH:mm",
                separator: ' to ',
                startDate: moment().subtract('days', 29),
                endDate: moment(),
                time: {
                    enabled: true
                },
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                    'Last 7 Days': [moment().subtract('days', 6), moment()],
                    'Last 30 Days': [moment().subtract('days', 29), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                },
            },
            function(start, end) {
                $('#defaultrange input').val(start.format("YYYY-MMMM-D HH:mm") + ' - ' + end.format("YYYY-MMMM-D HH:mm"));
                search_start = start;
                search_end = end;
            }
        );
        var load_autocomplete_component = function() {

            $.fn.select2.defaults.set("theme", "bootstrap");
            var placeholder = "Type to search";

            $(".select2, .select2-multiple").select2({
                placeholder: placeholder,
                width: null
            });

            $(".select2-allow-clear").select2({
                allowClear: true,
                placeholder: placeholder,
                width: null
            });

            function formatRepo(repo) {
                if (repo.loading) return repo.text;

                var markup = "<div class='select2-result-repository clearfix'>" +
                    "<div class='select2-result-repository__avatar'><img src='" + repo.owner.avatar_url + "' /></div>" +
                    "<div class='select2-result-repository__meta'>" +
                    "<div class='select2-result-repository__title'>" + repo.full_name + "</div>";

                if (repo.description) {
                    markup += "<div class='select2-result-repository__description'>" + repo.description + "</div>";
                }

                markup += "<div class='select2-result-repository__statistics'>" +
                    "<div class='select2-result-repository__forks'><span class='glyphicon glyphicon-flash'></span> " + repo.forks_count + " Forks</div>" +
                    "<div class='select2-result-repository__stargazers'><span class='glyphicon glyphicon-star'></span> " + repo.stargazers_count + " Stars</div>" +
                    "<div class='select2-result-repository__watchers'><span class='glyphicon glyphicon-eye-open'></span> " + repo.watchers_count + " Watchers</div>" +
                    "</div>" +
                    "</div></div>";

                return markup;
            }

            function formatRepoSelection(repo) {
                return repo.full_name || repo.text;
            }

            $(".js-data-example-ajax").select2({
                width: "off",
                ajax: {
                    url: "https://api.github.com/search/repositories",
                    dataType: 'json',
                    delay: 250,
                    data: function(params) {
                        return {
                            q: params.term, // search term
                            page: params.page
                        };
                    },
                    processResults: function(data, page) {
                        // parse the results into the format expected by Select2.
                        // since we are using custom formatting functions we do not need to
                        // alter the remote JSON data
                        return {
                            results: data.items
                        };
                    },
                    cache: true
                },
                escapeMarkup: function(markup) {
                    return markup;
                }, // let our custom formatter work
                minimumInputLength: 1,
                templateResult: formatRepo,
                templateSelection: formatRepoSelection
            });
            $("button[data-select2-open]").click(function() {
                $("#" + $(this).data("select2-open")).select2("open");
            });
            $(":checkbox").on("click", function() {
                $(this).parent().nextAll("select").prop("disabled", !this.checked);
            });
            $(".js-btn-set-scaling-classes").on("click", function() {
                $("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
                $("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
                $(this).removeClass("btn-primary btn-outline").prop("disabled", true);
            });
        };
        load_autocomplete_component();
        $(".loading_icon").show();
        page_datatable = $('#page_datatable').DataTable({
            "ajax": {
                "url": base_request_url + "/admin/reportPublisher",
                "type": "GET",
                "data": function(d) {
                    if (search_report_type != "") {
                        d.reportType = search_report_type;
                    } else {
                        d.reportType = 1; //default is giftcode
                    }
                    if (search_value != "") {
                        d.searchValue = search_value;
                    }
                    if (search_start != "") {
                        d.fromDate = search_start;
                    }
                    if (search_end != "") {
                        d.toDate = search_end;
                    }
                    d.limit = _per_page;
                    d.offset = _per_page * (_current_page - 1);
                    return d;
                },
                "contentType": "application/json",
                "dataType": "json",
                "dataSrc": function(json) {
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
                        $(".loading_icon_inside").show();
                        _current_page = parseInt($(e.target).attr("page"));
                        page_datatable.ajax.reload();
                    });
                    $(".loading_icon").hide();
                    $(".loading_icon_inside").hide();
                    if (json.dataArr != null) {
                        console.log(json);
                        $(".widget_total").attr("data-value", json.dataObj.totalGiftcode);
                        $(".widget_share").attr("data-value", json.dataObj.totalShare);
                        $(".widget_delivered").attr("data-value", json.dataObj.totalGiftcodeLost);
                        $(".widget_user").attr("data-value", json.dataObj.totalInstall);
                        $(".widget_nru").attr("data-value", json.dataObj.totalNRU);
                        $(".widget_info").counterUp();
                        return json.dataArr;
                    } else {
                        return [];
                    }
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
            "columns": [{
                title: "",
                data: null,
                render: function(data, type, full, meta) {
                    var str_response = "";
                    var event_id = full.nowReport.giftcodeEventId;
                    var event_name = full.nowReport.giftcodeEventName;
                    var event_title = ["Install", "Share FB", "Phát", "NRU"];
                    var event_report_now = [full.nowReport.numberInstall, full.nowReport.numberShareFacebook, full.nowReport.numberGiftcodeLost, full.nowReport.numberNRU];
                    var event_report_last = [full.lastReport.numberInstall, full.lastReport.numberShareFacebook, full.lastReport.numberGiftcodeLost, full.lastReport.numberNRU];
                    var event_class = ["record_install", "record_share", "record_giftcode_lost", "record_nru"];
                    if (search_report_type == 3) {
                        event_id = full.nowReport.giftcodeEventId;
                        event_name = full.nowReport.giftcodeEventName;
                        event_title = ["Install", "Share FB", "Delivered", "NRU"];
                        event_report_now = [full.nowReport.numberInstall, full.nowReport.numberShareFacebook, full.nowReport.numberGiftcodeLost, full.nowReport.numberNRU];
                        event_report_last = [full.lastReport.numberInstall, full.lastReport.numberShareFacebook, full.lastReport.numberGiftcodeLost, full.lastReport.numberNRU];
                        event_class = ["record_install", "record_share", "record_giftcode_lost", "record_nru"];
                    } else if (search_report_type == 2) {
                        event_id = full.nowReport.luckySpinId;
                        event_name = full.nowReport.luckySpinName;
                        event_title = ["Buy turn", "Profit", "User play"];
                        event_report_now = [full.nowReport.totalAmountBuyTurn, full.nowReport.totalAmountProfit, full.nowReport.totalPersonPlay];
                        event_report_last = [full.lastReport.totalAmountBuyTurn, full.lastReport.totalAmountProfit, full.lastReport.totalPersonPlay];
                        event_class = ["record_buy_turn", "record_profit", "record_user"];
                    }
                    str_response += "<div class='record_wrap'><a href='/dashboard_p_detail?id=" + event_id + "'><div class='record_title'><div>" + event_name + "</div><div class='event_id'>ID: " + event_id + "</div></div>";
                    for (var i = 0; i < event_title.length; i++) {
                        if (event_report_now[i] >= event_report_last[i]) {
                            str_response += "<div class='" + event_class[i] + " record_number'><div class='column_number'>" + event_report_now[i] + "</div><div class='change_info'> <i class='fa fa-arrow-up'></i> " + Math.abs(event_report_now[i] - event_report_last[i]) + " </div><div class='column_name'>" + event_title[i] + "</div></div>";
                        } else {
                            str_response += "<div class='" + event_class[i] + " record_number'><div class='column_number'>" + event_report_now[i] + "</div><div class='change_info_red'> <i class='fa fa-arrow-down'></i> " + Math.abs(event_report_now[i] - event_report_last[i]) + " </div><div class='column_name'>" + event_title[i] + "</div></div>";
                        }
                    }
                    // var format = getSetting(_setting_data, "date_format");
                    // var news_date = moment.unix(full.nowReport.onDate / 1000).format(format.value);
                    str_response += "</a></div>";
                    return str_response;
                }
            }],
            "aoColumnDefs": [
                { "sWidth": "100%", 'aTargets': [0] },
            ],
            "autoWidth": false,
            "lengthChange": false,
            "info": false,
            "bSort": false,
            "bFilter": false,
            "bPaginate": false,
            "fnDrawCallback": function(oSettings) {
                $("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function() {
                    return this.nodeType != 1;
                }).replaceWith("");
            },
        });
    };
    initpage();

    $(".search_submit").click(function() {
        $(".loading_icon_inside").show();
        search_value = $(".search_input").val();
        search_start = search_start.valueOf();
        search_end = search_end.valueOf();
        page_datatable.ajax.reload();
    });
    $(".tab_button").click(function() {
        $(".loading_icon_inside").show();
        search_report_type = $(this).attr("value");
        page_datatable.ajax.reload();
    });
    $(".export_button").click(function() {
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/reportPublisher",
            type: "GET",
            data: function(d) {
                if (search_report_type != "") {
                    d.reportType = search_report_type;
                } else {
                    d.reportType = 1; //default is giftcode
                }
                if (search_value != "") {
                    d.searchValue = search_value;
                }
                if (search_start != "") {
                    d.fromDate = search_start;
                }
                if (search_end != "") {
                    d.toDate = search_end;
                }
                d.limit = 100000;
                d.offset = 0;
                return d;
            },
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                console.log(data);
                var row_data = [];
                var filename = "";
                if (search_report_type == 1) {
                    filename = "Giftcode ";
                } else if (search_report_type == 2) {
                    filename = "Luckyspin ";
                } else if (search_report_type == 3) {

                }
                $.each(data.dataArr, function(key, item) {
                    var format = getSetting(_setting_data, "date_format");
                    var news_date = moment.unix(item.nowReport.onDate / 1000).format(format.value);
                    if (search_report_type == 1) {
                        row_data.push({
                            "ID": item.nowReport.giftcodeEventId,
                            "Name": item.nowReport.giftcodeEventName,
                            "Install": item.nowReport.numberInstall,
                            "Share FB": item.nowReport.numberShareFacebook,
                            "Delivered": item.nowReport.numberGiftcodeLost,
                            "NRU": item.nowReport.numberNRU,
                            "Time": news_date,
                        });
                    } else if (search_report_type == 2) {
                        row_data.push({
                            "ID": item.nowReport.luckySpinId,
                            "Name": item.nowReport.luckySpinName,
                            "Buy turn": item.nowReport.totalAmountBuyTurn,
                            "Profit": item.nowReport.totalAmountProfit,
                            "User play": item.nowReport.totalPersonPlay,
                            "Time": news_date,
                        });
                    } else if (search_report_type == 3) {

                    }
                });
                exportFile(row_data);
                $(".loading_icon").hide();
            },
            error: function(error) {
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
                $(".loading_icon").hide();
            },
        });
    });

    function exportFile(data) {
        $("body").excelexportjs({
            datatype: 'json',
            dataset: data,
            columns: getColumns(data)
        });
    }
});