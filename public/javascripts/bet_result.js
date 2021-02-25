//page variable
var page_datatable = null;
var search_value = null;
var editing_obj = null;
var item_name = "Result";
var item_names = "Results";
_per_page = 5;

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
    $(".loading_icon").show();

    page_datatable = $('#page_datatable').DataTable({
        "ajax": {
            "url": base_request_url + "/admin/bettingEvent",
            "type": "GET",
            "data": function(d) {
                if (search_value != null && search_value != "") {
                    d.searchValue = search_value;
                }
                d.limit = 10000;
                d.offset = 0;
                d.inBet = 2;
            },
            "contentType": "application/json",
            "dataType": "json",
            "dataSrc": function(json) {
                var arr_id = [];
                $(json.dataArr).each(function(key, item) {
                    arr_id.push(item.inMatch.id + "-" + item.id);
                });

                //socket
                const socket = io('https://socket.simba-app.com');
                socket.on('connect', function() {
                    console.log("connected");
                    $(".loading_icon").hide();
                    $(arr_id).each(function(key, item_key) {
                        socket.on(item_key, function(data) {
                            $(".ticket_" + item_key).parent().removeClass("changing");
                            $(".ticket_" + item_key).parent().addClass("changing");
                            $(".ratio_" + item_key).parent().removeClass("changing");
                            $(".ratio_" + item_key).parent().addClass("changing");
                            $(".amount_" + item_key).parent().removeClass("changing");
                            $(".amount_" + item_key).parent().addClass("changing");
                            $(".ticket_" + item_key).html(data.dataResponse.countFirstTeam + " - " + data.dataResponse.countSecondTeam);
                            $(".ratio_" + item_key).html(data.dataResponse.ratioBetFirstTeam + " - " + data.dataResponse.ratioBetSecondTeam);
                            $(".amout_" + item_key).html(data.dataResponse.amountBetFirstTeam + " - " + data.dataResponse.amountBetSecondTeam);
                        });
                    });
                });
                socket.open();
                $(".loading_icon_inbet_match").hide();
                if (json.dataArr != null) {
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
        "columns": [
            { title: "ID", data: "id" },
            { title: "Match", data: "inMatch.name" },
            { title: "Name", data: "name" },
            {
                title: "Teams",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += full.inMatch.firstTeam.name + " - " + full.inMatch.secondTeam.name;
                    return return_str;
                }
            },
            {
                title: "Ratio",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += "<span class='live_info ratio_" + full.inMatch.id + "-" + full.id + "'>" + full.bettingRatios[0].firstTeamRatio + " - " + full.bettingRatios[0].secondTeamRatio + "</div>";
                    return return_str;
                }
            },
            {
                title: "Tickets",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += "<span class='live_info ticket_" + full.inMatch.id + "-" + full.id + "'>" + full.totalBetEventBean.totalPersonBetFirstTeam + " - " + full.totalBetEventBean.totalPersonBetSecondTeam + "</div>";
                    return return_str;
                }
            },
            {
                title: "Amount",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += "<span class='live_info amount_" + full.inMatch.id + "-" + full.id + "'>" + full.totalBetEventBean.totalAmountBetFirstTeam + " - " + full.totalBetEventBean.totalAmountBetSecondTeam + "</div>";
                    return return_str;
                }
            },
            {
                title: "Action",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Update </a>";
                    return return_str;
                }
            }
        ],
        "aoColumnDefs": [
            { "sWidth": "2%", 'aTargets': [0] },
            { "sWidth": "10%", 'aTargets': [1] },
            { "sWidth": "10%", 'aTargets': [2] },
            { "sWidth": "20%", 'aTargets': [3] },
            { "sWidth": "10%", "className": "dt-center", 'aTargets': [4] },
            { "sWidth": "10%", "className": "dt-center", 'aTargets': [5] },
            { "sWidth": "15%", "className": "dt-center", 'aTargets': [6] },
            {
                "sWidth": "10%",
                'aTargets': [7]
            },
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

            // event for all component inside datatable
            $(".btn_edit_item").click(function() {
                var obj_temp = JSON.parse($(this).attr("item_obj"));
                console.log(obj_temp);
                editing_item = obj_temp.id;
                editing_obj = obj_temp;
                $('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
                $('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
                $("#single_select_match").val(obj_temp.inMatch.id);
                load_autocomplete_component();
                $('.txt_add_edit_item_date_start').val(moment.unix(obj_temp.startBettingTime / 1000).format("YYYY-MMMM-D HH:mm"));
                $('.txt_add_edit_item_date_end').val(moment.unix(obj_temp.endBettingTime / 1000).format("YYYY-MMMM-D HH:mm"));
                $(".txt_first_team_ratio").val(obj_temp.bettingRatios[0].firstTeamRatio);
                $(".txt_second_team_ratio").val(obj_temp.bettingRatios[0].secondTeamRatio);
                $(".team1_winner").html(obj_temp.inMatch.firstTeam.name);
                $(".help_team1").html(obj_temp.inMatch.firstTeam.name);
                $(".team2_winner").html(obj_temp.inMatch.secondTeam.name);
                $(".help_team2").html(obj_temp.inMatch.secondTeam.name);

                $('#modal_add_edit .btn_modal_save_new').hide();
                $('#modal_add_edit .btn_modal_save_update').show();
                if (obj_temp.betType == 1) {
                    if (obj_temp.teamWon == 2) {
                        $(".result_amount").html(Math.round((obj_temp.totalBetEventBean.totalAmountBetFirstTeam + obj_temp.totalBetEventBean.totalAmountBetSecondTeam) - obj_temp.totalBetEventBean.amountCashBackSecondTeam));
                    } else {
                        $(".result_amount").html(Math.round((obj_temp.totalBetEventBean.totalAmountBetFirstTeam + obj_temp.totalBetEventBean.totalAmountBetSecondTeam) - obj_temp.totalBetEventBean.amountCashBackFirstTeam));
                    }
                } else {
                    if (obj_temp.teamWon == 2) {
                        $(".result_amount").html(Math.round((obj_temp.totalBetEventBean.totalAmountBetFirstTeam + obj_temp.totalBetEventBean.totalAmountBetSecondTeam) - (obj_temp.totalBetEventBean.totalAmountBetSecondTeam * obj_temp.bettingRatios[0].secondTeamRatio)));
                    } else {
                        $(".result_amount").html(Math.round((obj_temp.totalBetEventBean.totalAmountBetFirstTeam + obj_temp.totalBetEventBean.totalAmountBetSecondTeam) - (obj_temp.totalBetEventBean.totalAmountBetFirstTeam * obj_temp.bettingRatios[0].firstTeamRatio)));
                    }
                }
                if (obj_temp.teamWon == 2) {
                    $('.select_winner').val(2);
                } else {
                    $('.select_winner').val(1);
                }
                //team won
                $('.select_winner').selectpicker('refresh');

                //set type
                $(".select_bet_type option").filter(function() {
                    return $.trim($(this).val()) == obj_temp.betType;
                }).prop('selected', true);
                $('.select_bet_type').selectpicker('refresh');

                //set status
                $(".select_status option").filter(function() {
                    return $.trim($(this).val()) == obj_temp.status;
                }).prop('selected', true);
                $('.select_status').selectpicker('refresh');
                if (obj_temp.status == 'active') {
                    $('.select_status button').css('background-color', '#32c5d2');
                } else {
                    $('.select_status button').css('background-color', 'red');
                }
                $('.btn_delete_item').show();
                $('.btn_delete_item').attr("item_id", obj_temp.id);
                $('#modal_add_edit').modal('show');
            });
        },
    });

    //button events
    $('.btn_confirm_yes').click(function() {
        var start_date = new Date($('.txt_add_edit_item_date_start').val()).getTime();
        var end_date = new Date($('.txt_add_edit_item_date_end').val()).getTime();
        _send_info.data = {
            "bettingEventId": editing_item,
            "name": $(".txt_add_edit_item_name").val(),
            "startBettingTime": new moment($(".txt_add_edit_item_date_start").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
            "endBettingTime": new moment($(".txt_add_edit_item_date_end").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
            "matchId": $("#single_select_match").val(),
            "betType": $(".select_bet_type option:selected").val(),
            "firstTeamRatio": $(".txt_first_team_ratio").val(),
            "secondTeamRatio": $(".txt_second_team_ratio").val(),
            "status": $(".select_status option:selected").val(),
            "teamWon": $(".select_winner option:selected").val(),
        };
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/bettingEvent",
            type: "PUT",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                $('#modal_confirm').modal('hide');
                page_datatable.ajax.reload(null, false);
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'");
                    $('#modal_add_edit').modal('hide');
                } else {
                    show_toast_notif("error", "Fail", data.onlyMessage);
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $('#modal_confirm').modal('hide');
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
                $(".loading_icon").hide();
            },
        });
    });
    $('.btn_modal_save_update').click(function() {
        $('#modal_confirm').modal('show');
    });
    $('.select_winner').change(function() {
        if (editing_obj.betType == 1) {
            if ($(this).val() == 2) {
                $(".result_amount").html(Math.round((editing_obj.totalBetEventBean.totalAmountBetFirstTeam + editing_obj.totalBetEventBean.totalAmountBetSecondTeam) - editing_obj.totalBetEventBean.amountCashBackSecondTeam));
            } else {
                $(".result_amount").html(Math.round((editing_obj.totalBetEventBean.totalAmountBetFirstTeam + editing_obj.totalBetEventBean.totalAmountBetSecondTeam) - editing_obj.totalBetEventBean.amountCashBackFirstTeam));
            }
        } else {
            if ($(this).val() == 2) {
                $(".result_amount").html(Math.round((editing_obj.totalBetEventBean.totalAmountBetFirstTeam + editing_obj.totalBetEventBean.totalAmountBetSecondTeam) - (editing_obj.totalBetEventBean.totalAmountBetSecondTeam * editing_obj.bettingRatios[0].secondTeamRatio)));
            } else {
                $(".result_amount").html(Math.round((editing_obj.totalBetEventBean.totalAmountBetFirstTeam + editing_obj.totalBetEventBean.totalAmountBetSecondTeam) - (editing_obj.totalBetEventBean.totalAmountBetFirstTeam * editing_obj.bettingRatios[0].firstTeamRatio)));
            }
        }
    });
    $(".btn_refresh").click(function() {
        $(".loading_icon_inbet_match").show();
        page_datatable.ajax.reload();
    });
    _send_info.data = {
        "limit": 10000,
        "offset": 0
    };
    $.ajax({
        url: base_request_url + "/admin/matchs",
        type: "GET",
        data: _send_info.data,
        contentType: "application/json",
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            console.log(data);
            $(data.dataArr).each(function(key, item) {
                $("#single_select_match").append("<option value='" + item.id + "'> " + item.name + "</option>");
            });
            if (data.dataArr[0] != undefined) {
                $("#single_select_match").val(data.dataArr[0].id);
                $(".team1_winner").html(data.dataArr[0].firstTeam.name);
                $(".help_team1").html(data.dataArr[0].firstTeam.name);
                $(".team2_winner").html(data.dataArr[0].secondTeam.name);
                $(".help_team2").html(data.dataArr[0].secondTeam.name);
                load_autocomplete_component();
            }
        },
        error: function(err) {
            console.log(err.error());
        }
    });
};

function objectifyForm(formArray) {
    //serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}

function get_data_by_name(dataArr, name) {
    var result_item = null;
    $(dataArr).each(function(key, item) {
        if (item.name == name) {
            result_item = item;
        }
    });
    return result_item;
}
load_autocomplete_component = function() {
    // Set the "bootstrap" theme as the default theme for all Select2
    // widgets.
    //
    // @see https://github.com/select2/select2/issues/2927
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

    // @see https://select2.github.io/examples.html#data-ajax
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
        if ($(this).val() == 1 && $(this).parent().hasClass("checked")) {
            $(".appname_group").show();
            $(".txt_add_edit_item_package_android").attr("name", "androidPackage");
            $(".txt_add_edit_item_package_ios").attr("name", "iosSchemes");
        } else if ($(this).val() == 1 && !$(this).parent().hasClass("checked")) {
            $(".appname_group").hide();
            $(".txt_add_edit_item_package_android").attr("name", "");
            $(".txt_add_edit_item_package_ios").attr("name", "");
        }
        if ($(this).val() == 3 && $(this).parent().hasClass("checked")) {
            $(".share_group").show();
            $(".txt_add_edit_item_share").attr("name", "urlShareFB");
        } else if ($(this).val() == 3 && !$(this).parent().hasClass("checked")) {
            $(".share_group").hide();
            $(".txt_add_edit_item_share").attr("name", "");
        }
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
    });

    $(".js-btn-set-scaling-classes").on("click", function() {
        $("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
        $("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
        $(this).removeClass("btn-primary btn-outline").prop("disabled", true);
    });
};

$(document).ready(function() {
    Page_script.init();
    load_page();
});