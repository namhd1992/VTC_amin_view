//page variable
var editing_item = null;
var item_name = "Outcome Report";
var item_names = "Outcome Report";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
_current_page = 1;
var search_value = null;
var start_time = null;
var end_time = null;
var from_amount = null;
var to_amount = null;
var payment_type = null;
var doneTypingInterval = 1000;
var searching_value_timeout = "";
var typingTimer;
var transaction_scoin_id = null;
var fund_id = 1;
var load_autocomplete_component;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

function str_pad(n) {
    return String("00" + n).slice(-2);
}

var load_page = function() {
    load_autocomplete_component = function() {
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
        $("#single_select").change(function() {});
    };

    $(".loading_icon").show();
    //ajax get all datatable items
    _send_info.data = {
        "limit": _per_page,
        "offset": 0,
    };

    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });
    var remove_channel = function(id) {
        channel_arr.splice(channel_arr.indexOf(id), 1);
    };

    page_datatable = $('#page_datatable').DataTable({
        "ajax": {
            "url": base_request_url + "/admin/fundsHistory",
            "type": "GET",
            "data": function(d) {
                if (getUrlParameter("id") != undefined) {
                    fund_id = getUrlParameter("id");
                }
                console.log(fund_id);
                d.moneyFundId = fund_id;
                d.type = "outcome";
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
                            x
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
            {
                title: "User",
                data: null,
                render: function(data, type, full, meta) {
                    var user_data = "";
                    user_data = full.transactionHistory.sender.fullName;
                    return user_data;
                }
            },
            { title: "Amount Income", data: "totalAmountIncome" },
            { title: "Fund Amount", data: "curAmountIncome" },

            {
                title: "Date",
                data: null,
                render: function(data, type, full, meta) {
                    var format = getSetting(_setting_data, "date_format");
                    var news_date = moment.unix(full.createOn / 1000).format(format.value);
                    return news_date;
                }
            },
        ],
        "aoColumnDefs": [
            { "sWidth": "3%", 'aTargets': [0] },
            { "sWidth": "20%", 'aTargets': [1] },
            { "sWidth": "20%", 'aTargets': [2] },
            { "sWidth": "20%", 'aTargets': [3] },
            { "sWidth": "20%", 'aTargets': [4] },
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
                $('.info_transaction_scoin_id').html(obj_temp.transactionScoinId);
                $('.info_scoin_acc').html(obj_temp.accountScoinId);
                $('.info_amount').html(obj_temp.totalPayment);
                $('.info_type').html(obj_temp.paymentType);
                $('.info_gameid').html(obj_temp.gameID);
                $('.info_state').html(obj_temp.errorDesc);
                var format = getSetting(_setting_data, "date_format");
                var news_date = moment.unix(obj_temp.createOn / 1000).format(format.value);
                $('.info_created_on').html(news_date);
                $('#modal_add_edit').modal('show');
            });
            $('.btn_delete_item').click(function() {
                deleted_id = parseInt($(this).attr("item_id"));
                $("#modal_confirm").modal("show");
            });
        },
    });

    $.ajax({
        url: base_request_url + "/admin/moneyFunds",
        type: "GET",
        data: {
            type: "outcome"
        },
        contentType: "application/json",
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(json) {
            var report_data = [];
            var total_lp = 0;
            // Create the pie chart
            $("#single_select_fund").html();
            $(json.dataArr).each(function(key, item) {
                report_data.push({
                    "number": item.name,
                    "LP": item.fundsAmount,
                    "LP": item.fundsAmount
                });
                total_lp += parseInt(item.fundsAmount);
                $("#single_select_fund").append("<option value='" + item.id + "'>" + item.fundsName + "</option>");
            });
            if (getUrlParameter("id") != undefined) {
                fund_id = getUrlParameter("id");
                $("#single_select_fund").val(fund_id);
            }
            load_autocomplete_component();
            var colors = Highcharts.getOptions().colors;
            var color_order = 0;
            var income_lp = [];
            $(json.dataArr).each(function(key, item) {
                income_lp.push({
                    y: parseFloat(((parseInt(item.fundsAmount) / total_lp) * 100).toFixed(2)),
                    color: colors[color_order],
                    value: parseInt(item.fundsAmount)
                });
                color_order++;
            });
            var categories = json.dataArr.map(function(a) { return a.fundsName; });
            var income_data = [];

            var dataLen = report_data.length;
            for (i = 0; i < dataLen; i += 1) {
                income_data.push({
                    name: categories[i] + " (" + income_lp[i].value + ") ",
                    y: income_lp[i].y,
                    color: income_lp[i].color
                });
            }
            Highcharts.chart('pieChart1', {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Outcome total percents'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    valueSuffix: '%'
                },
                series: [{
                    name: 'Percentage',
                    data: income_data,
                    size: '100%',
                    dataLabels: {
                        formatter: function() {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -30
                    }
                }]
            });
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
        fund_id = $("#single_select_fund").val();
        page_datatable.ajax.reload(null, false);
    });
    // copy Bootstrap validation states to Select2 dropdown
    //
    // add .has-waring, .has-error, .has-succes to the Select2 dropdown
    // (was #select2-drop in Select2 v3.x, in Select2 v4 can be selected via
    // body > .select2-container) if _any_ of the opened Select2's parents
    // has one of these forementioned classes (YUCK! ;-))
    $(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function() {
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

    });

};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();
});