//page variable
var editing_item = null;
var item_name = "Comment";
var item_names = "Comments";
var deleted_id = null;
var page_datatable = null;
var data_list = null;
_current_page = 1;
var search_value = null;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var load_page = function() {

    //ajax get all channels
    _send_info.data = {};

    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });
    $.fn.dataTable.ext.errMode = 'none';
    page_datatable = $('#page_datatable').DataTable({
        ajax: {
            "url": base_request_url + "/getCommentArticle",
            "type": "POST",
            "data": function(d) {
                var selected_status = $(".filter_link_active").attr("status_val");
                var return_data = {
                    "limit": _per_page,
                    "offset": _per_page * (_current_page - 1),
                };
                if (selected_status != "all") {
                    return_data.status = selected_status;
                }
                if (search_value != null) {
                    return_data.searchValue = search_value;
                }
                return JSON.stringify(return_data);
            },
            "contentType": "application/json",
            "dataType": "json",
            "dataSrc": function(json) {
                var selected_status = $(".filter_link_active").attr("status_val");
                data_list = json.dataArr;
                var total_all = data_list.length;
                var total_active = 0;
                var total_inactive = 0;
                $(data_list).each(function(key, item) {
                    if (item.status == "active") {
                        total_active++;
                    } else {
                        total_inactive++;
                    }
                    if (selected_status != "all") {
                        if (item.status != selected_status) {
                            data_list.splice(data_list.indexOf(item), 1);
                        }
                    }
                });
                $.ajax({
                    url: base_request_url + "/getCommentArticle",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "limit": 1,
                        "offset": 0,
                        "status": "active"
                    }),
                    dataType: "json",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                    },
                    success: function(data) {
                        $(".filter_active").html(data.totalRecords);
                    },
                    error: function(error) {
                        console.log(error);
                    },
                });
                $.ajax({
                    url: base_request_url + "/getCommentArticle",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "limit": 1,
                        "offset": 0
                    }),
                    dataType: "json",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                    },
                    success: function(data) {
                        $(".filter_all").html(data.totalRecords);
                    },
                    error: function(error) {
                        console.log(error);
                    },
                });
                $.ajax({
                    url: base_request_url + "/getCommentArticle",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "limit": 1,
                        "offset": 0,
                        "status": "inactive"
                    }),
                    dataType: "json",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                    },
                    success: function(data) {
                        $(".filter_inactive").html(data.totalRecords);
                    },
                    error: function(error) {
                        console.log(error);
                    },
                });
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
                return data_list;
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
                title: "Avatar",
                data: null,
                render: function(data, type, full, meta) {
                    var u_name = full.firstName + " " + full.lastName;
                    if (full.firstName == null && full.lastName == null) {
                        u_name = "Anonymous";
                    }
                    var html_str = "";
                    var ava = "/images/default_ava.jpg";
                    if (full.urlAvatar !== null) {
                        ava = full.urlAvatar;
                    }
                    html_str += "<img class='userava_tbl'src='" + ava + "' />";
                    return html_str;
                }
            },
            {
                title: "Username",
                data: null,
                render: function(data, type, full, meta) {
                    var u_name = full.fullName;
                    if (full.fullName == null || full.fullName == "") {
                        u_name = full.userName;
                    }
                    var html_str = "";
                    var ava = "/images/default_ava.jpg";
                    if (full.urlAvatar !== null) {
                        ava = full.urlAvatar;
                    }
                    html_str += "<div class='username_tbl'>" + u_name + "</div>";
                    return html_str;
                }
            },
            {
                title: "Content",
                data: null,
                render: function(data, type, full, meta) {
                    var html_str = "";
                    html_str += "<div class='title_content'>";
                    html_str += full.content;
                    html_str += "</div>";
                    return html_str;
                }
            },
            {
                title: "Article",
                data: null,
                render: function(data, type, full, meta) {
                    var html_str = "";
                    html_str += full.titleNewsOverView;
                    html_str += " ( <i class='fa fa-commenting'></i> " + full.numberComment + ")";
                    return html_str;
                }
            },
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
                title: "Action",
                data: null,
                render: function(data, type, full, meta) {
                    var html_str = "";
                    if (checkFunction("updateComment")) {
                        html_str += "<a class='btn_edit_item btn btn-link' item_id='" + full.commentId + "' item_obj='" + escape(JSON.stringify(full)) + "' ><i class='icon-wrench'></i> Edit </a>";
                    }
                    if (checkFunction("deleteComment")) {
                        html_str += "<a class='btn_delete_item btn btn-link' item_id='" + full.commentId + "' ><i class='icon-trash'></i> Delete </a>";
                    }
                    return html_str;
                }
            },
        ],
        "aoColumnDefs": [
            { "sWidth": "10%", 'aTargets': [0] },
            { "sWidth": "20%", 'aTargets': [1] },
            { "sWidth": "30%", 'aTargets': [2] },
            { "sWidth": "30%", 'aTargets': [3] },
            { "sWidth": "10%", 'aTargets': [4] },
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
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("form-control");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-inline");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-medium");
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("placeholder", 'Search...');
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("id", 'inputSuccess');

            // event for all component inside datatable
            $(".btn_edit_item").click(function() {
                editing_item = $(this).attr("item_id");
                var obj_temp = findBy(data_list, editing_item, "commentId");
                console.log(obj_temp);
                $('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.commentId);
                $('#modal_add_edit .area_add_edit_item_title').val(obj_temp.content);
                $('#modal_add_edit .btn_modal_save_new').hide();
                $('#modal_add_edit .btn_modal_save_update').show();
                //set status
                jQuery(".select_status option").filter(function() {
                    return $.trim($(this).val()) == obj_temp.status;
                }).prop('selected', true);
                $('.select_status').selectpicker('refresh');
                if (obj_temp.status == 'active') {
                    $('.select_status button').css('background-color', '#32c5d2');
                } else {
                    $('.select_status button').css('background-color', 'red');
                }
                $('#modal_add_edit').modal('show');
            });
            $('.btn_delete_item').click(function() {
                deleted_id = parseInt($(this).attr("item_id"));
                $("#modal_confirm").modal("show");
            });
        }
    });
    $('#page_datatable').on('order.dt', function() {})
        .on('search.dt', function() {})
        .on('page.dt', function() {})
        .dataTable();
};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();

    //event for modal
    $(".search_submit").click(function() {
        search_value = $(".search_input").val();
        page_datatable.ajax.reload(null, false);
    });
    $(".search_clear").click(function() {
        $(".search_input").val("");
        search_value = "";
        page_datatable.ajax.reload(null, false);
    });
    $('.btn_modal_save_update').click(function() {
        _send_info.data = {
            "content": $(".area_add_edit_item_title").val(),
            "status": $(".select_status option:selected").val(),
            "commentId": editing_item
        };
        $.ajax({
            url: base_request_url + "/admin/commentArticle",
            type: "PUT",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function() {
                _send_info.data = {
                    "limit": 10000,
                    "offset": 0,
                };
                page_datatable.ajax.reload(null, false);
                $('#modal_add_edit').modal('hide');
                show_toast_notif("success", "Successfully", "Updated '" + editing_item + "'", function() {
                    //action when click on notif
                });
            },
            error: function(error) {
                show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".filter_link").click(function() {
        $(".filter_link").removeClass("filter_link_active");
        $(this).addClass("filter_link_active");
        _send_info.data = {
            "limit": 10000,
            "offset": 0,
        };
        page_datatable.ajax.reload(null, false);
    });
    $('.select_status').change(function() {
        if ($(this).val() == 'active') {
            $('.select_status button').css('background-color', '#32c5d2');
        } else if ($(this).val() == 'inactive') {
            $('.select_status button').css('background-color', 'red');
        }
    });
    $('.btn_confirm_yes').click(function() {
        _send_info.data = {
            "commentId": deleted_id
        };
        $.ajax({
            url: base_request_url + "/admin/commentArticle",
            type: "DELETE",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function() {
                $('#modal_confirm').modal('hide');
                _send_info.data = {};
                page_datatable.ajax.reload();
                $('#modal_add_edit').modal('hide');
                show_toast_notif("success", "Successfully", "Deleted: '" + deleted_id + "'", function() {
                    //action when click on notif
                });
            },
            error: function(error) {
                show_toast_notif("error", "Error", "'" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
});