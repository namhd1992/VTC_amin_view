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
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";

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
            if ($(this).attr("id") == "single_select_match") {
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
                            "searchValue": $(typing_input).val(),
                        };
                        searching_value_timeout = $(typing_input).val();
                        $("#single_select_match").html("");
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
                                var tags_arr = [];
                                $(data.dataArr).each(function(key, item) {
                                    $("#single_select_match").append("<option value='" + item.id + "'> " + item.name + "</option>");
                                });
                                $(".team1_winner").html(data.dataArr[0].firstTeam.name);
                                $(".help_team1").html(data.dataArr[0].firstTeam.name);
                                $(".team2_winner").html(data.dataArr[0].secondTeam.name);
                                $(".help_team2").html(data.dataArr[0].secondTeam.name);
                                load_autocomplete_component();
                                $("#single_select_match").select2("open");
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

        $(".js-btn-set-scaling-classes").on("click", function() {
            $("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
            $("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
            $(this).removeClass("btn-primary btn-outline").prop("disabled", true);
        });
    };

    //ajax get all datatable items
    _send_info.data = {
        "limit": _per_page,
        "offset": _per_page * (_current_page - 1),
    };

    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });

    page_datatable = $('#page_datatable').DataTable({
        "ajax": {
            "url": base_request_url + "/admin/bettingEvent",
            "type": "GET",
            "data": function(d) {
                if (getUrlParameter("match") != undefined) {
                    filter_match = getUrlParameter("match");
                }
                if (filter_match != null && filter_match != "") {
                    d.matchId = filter_match;
                }
                if (filter_name != null && filter_name != "") {
                    d.searchValue = filter_name;
                }
                d.limit = _per_page;
                d.offset = _per_page * (_current_page - 1);
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
                    _current_page = parseInt($(e.target).attr("page"));
                    page_datatable.ajax.reload();
                });
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
            { title: "Event", data: "name" },
            { title: "Match", data: "inMatch.name" },
            {
                title: "Status",
                data: null,
                render: function(data, type, full, meta) {
                    if (full.status == "active") {
                        data = "<div class='active_status'>" + full.status + "</div>";
                    } else {
                        data = "<div class='inactive_status'>" + full.status + "</div>";
                    }
                    return data;
                }
            },
            {
                title: "Start bet",
                data: null,
                render: function(data, type, full, meta) {
                    var str_date = moment.unix(full.startBettingTime / 1000).format("YYYY-MMMM-D HH:mm");
                    return str_date;
                }
            },
            {
                title: "End bet",
                data: null,
                render: function(data, type, full, meta) {
                    var str_date = moment.unix(full.endBettingTime / 1000).format("YYYY-MMMM-D HH:mm");
                    return str_date;
                }
            },
            {
                title: "Action",
                data: null,
                render: function(data, type, full, meta) {
                    var return_str = "";
                    return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
                    return_str += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
                    return return_str;
                }
            }
        ],
        "aoColumnDefs": [
            { "sWidth": "2%", 'aTargets': [0] },
            { "sWidth": "10%", 'aTargets': [1] },
            { "sWidth": "10%", 'aTargets': [2] },
            { "sWidth": "5%", 'aTargets': [3] },
            { "sWidth": "20%", 'aTargets': [4] },
            { "sWidth": "20%", 'aTargets': [5] },
            { "sWidth": "10%", 'aTargets': [6] },
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
                var current_timestamp = Math.floor(Date.now() / 1000);
                if ((obj_temp.startBettingTime / 1000) < current_timestamp && current_timestamp < (obj_temp.endBettingTime / 1000)) {
                    $(".select_bet_type button").attr("disabled", "disabled");
                } else {
                    $(".select_bet_type button").removeAttr("disabled");
                }
                $('#modal_add_edit .btn_modal_save_new').hide();
                $('#modal_add_edit .btn_modal_save_update').show();

                //team won
                if (obj_temp.teamWon != 0) {
                    $(".unknow_winner").attr("disabled", "disabled");
                } else {
                    $(".unknow_winner").removeAttr("disabled");
                }
                $(".select_winner option").filter(function() {
                    return $.trim($(this).val()) == obj_temp.teamWon;
                }).prop('selected', true);
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
            $('.btn_delete_item').click(function() {
                var obj_temp = JSON.parse($(this).attr("item_obj"));
                deleted_obj = obj_temp;
                deleted_id = obj_temp.id;
                $("#modal_confirm").modal("show");
            });
        },
    });

    $(".btn_add_new_item").click(function() {
        $('#modal_add_edit .modal-title').html("Create new " + item_name);
        $('#modal_add_edit input:text').val("");
        $('#modal_add_edit textarea').val("");
        $(".select_bet_type button").removeAttr("disabled");
        if (filter_match != undefined && filter_match != "") {
            $('#single_select_match').val(filter_match);
        } else {
            $('#single_select_match').val("");
        }
        load_autocomplete_component();
        $(".select_status option").filter(function() {
            return $.trim($(this).val()) == "active";
        }).prop('selected', true);
        $('.select_status').selectpicker('refresh');
        $('.select_status button').css('background-color', '#32c5d2');
        $('#modal_add_edit .btn_modal_save_new').show();
        $('#modal_add_edit .btn_modal_save_update').hide();
        $("#modal_add_edit").modal("show");
    });
    $('.date-picker').datepicker({
        rtl: App.isRTL(),
        orientation: "left",
        autoclose: true
    });

    //event for modal
    $('.btn_confirm_yes').click(function() {
        $.ajax({
            url: base_request_url + "/admin/bettingEvent?bettingEventId=" + deleted_id,
            type: "DELETE",
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                $('#modal_confirm').modal('hide');
                _send_info.data = {};
                page_datatable.ajax.reload();
                show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function() {});
            },
            error: function(error) {
                show_toast_notif("error", "Error", "'" + error.responseText + "'", function() {});
            },
        });
    });
    $('.btn_modal_save_new').click(function() {
        if ($(".txt_add_edit_item_name").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required", function() {});
            return;
        }
        if ($(".txt_add_edit_item_date_start").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " start betting time is required", function() {});
            return;
        }
        if ($(".txt_add_edit_item_date_end").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " end betting time is required", function() {});
            return;
        }
        var start_date = new Date($('.txt_add_edit_item_date_start').val()).getTime();
        var end_date = new Date($('.txt_add_edit_item_date_end').val()).getTime();
        var current_date = new Date().getTime();
        if (start_date > end_date) {
            show_toast_notif("error", "Unable to create " + item_name, "Date range is invalid", function() {});
            return;
        }
        _send_info.data = {
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
            type: "POST",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                page_datatable.ajax.reload(null, false);
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function() {});
                    $('#modal_add_edit').modal('hide');
                } else {
                    show_toast_notif("error", "Fail", data.onlyMessage, function() {});
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {});
                $(".loading_icon").hide();
            },
        });
    });
    $('.btn_modal_save_update').click(function() {
        if ($(".txt_add_edit_item_name").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required", function() {});
            return;
        }
        if ($(".txt_add_edit_item_date_start").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " start date is required", function() {});
            return;
        }
        if ($(".txt_add_edit_item_date_end").val() == "") {
            show_toast_notif("error", "Unable to create " + item_name, item_name + " end date is required", function() {});
            return;
        }
        var start_date = new Date($('.txt_add_edit_item_date_start').val()).getTime();
        var end_date = new Date($('.txt_add_edit_item_date_end').val()).getTime();
        var current_date = new Date().getTime();
        if (start_date > end_date) {
            show_toast_notif("error", "Unable to create " + item_name, "Date range is invalid", function() {});
            return;
        }
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
                page_datatable.ajax.reload(null, false);
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function() {
                        //action when click on notif
                    });
                    $('#modal_add_edit').modal('hide');
                } else {
                    show_toast_notif("error", "Fail", data.onlyMessage, function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
                $(".loading_icon").hide();
            },
        });
    });
    $('.select_status').change(function() {
        if ($(this).val() != "") {
            if ($(this).val() == 'active') {
                $('.select_status button').css('background-color', '#32c5d2');
            } else if ($(this).val() == 'inactive') {
                $('.select_status button').css('background-color', 'red');
            }
            $(".hidden_item_status").val($(this).val());
        }
    });
    $(".search_submit").click(function() {
        if ($("#single_select_match_filter").val() != "") {
            filter_match = parseInt($("#single_select_match_filter").val());
        }
        filter_name = $(".search_input").val();
        page_datatable.ajax.reload(null, false);
    });
    $(".search_clear").click(function() {
        filter_match = "";
        filter_name = "";
        $("#single_select_match_filter").val("");
        $(".search_input").val("");
        $("#single_select_match").val("");
        load_autocomplete_component();
        page_datatable.ajax.reload(null, false);
    });
    $(".form_datetime").datetimepicker({
        autoclose: true,
        isRTL: App.isRTL(),
        format: "yyyy-MM-dd hh:ii",
        pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
    });
    _send_info.data = {
        "limit": 10,
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
                $("#single_select_match_filter").append("<option value='" + item.id + "'> " + item.name + "</option>");
            });
            if (getUrlParameter("match") != undefined) {
                filter_match = getUrlParameter("match");
                $("#single_select_match_filter").val(filter_match);
                $("#single_select_match").val(filter_match);
            }
            $(".team1_winner").html(data.dataArr[0].firstTeam.name);
            $(".help_team1").html(data.dataArr[0].firstTeam.name);
            $(".team2_winner").html(data.dataArr[0].secondTeam.name);
            $(".help_team2").html(data.dataArr[0].secondTeam.name);
            load_autocomplete_component();
            $(".loading_icon").hide();
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

jQuery(document).ready(function() {
    Page_script.init();
    load_page();

});