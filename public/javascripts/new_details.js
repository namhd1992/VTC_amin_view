//page variable
var editing_item = null;
var item_name = "Tag";
var item_names = "Tags";
var deleted_id = null;
var page_datatable = null;
var artical_id = null;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var load_page = function() {

    //ajax get all channels
    article_id = getUrlParameter("id");
    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });
    _send_info.data = {
        "newsId": article_id
    };
    page_datatable = $('#page_datatable').DataTable({
        ajax: {
            "url": base_request_url + "/getCommentArticle",
            "type": "POST",
            "data": function(d) {
                return JSON.stringify(_send_info.data);
            },
            "contentType": "application/json",
            "dataType": "json",
            "dataSrc": function(json) {
                console.log(json.dataArr);
                console.log("custom");
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
        columns: [
            // { title: "ID", data: "commentId" },
            // { title: "Name", data: "name" },
            {
                title: "News",
                data: null,
                render: function(data, type, full, meta) {
                    var ava = "/images/default_ava.jpg";
                    if (full.urlAvatar !== null) {
                        ava = full.urlAvatar;
                    }
                    var username = "Unknow";
                    if (full.firstName !== null && full.lastName !== null) {
                        username = full.firstName + ' ' + full.lastName;
                    }
                    var d = new Date(full.createOn);
                    var time = _month_names[d.getMonth()] + " " + d.getDate() + ', ' + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                    var return_str = "";
                    return_str += '<div class="mt-comments">';
                    return_str += '<div class="mt-comment">';
                    return_str += '<div class="mt-comment-img">';
                    return_str += '<img src="' + ava + '" /> </div>';
                    return_str += '<div class="mt-comment-body">';
                    return_str += '<div class="mt-comment-info">';
                    return_str += '<span class="mt-comment-author">' + username + '</span>';
                    return_str += '<span class="mt-comment-date">' + time + '</span>';
                    return_str += '</div>';
                    return_str += '<div class="mt-comment-text">' + full.content + '</div>';
                    return_str += '<div class="mt-comment-details">';
                    return_str += '<span class="mt-comment-status mt-comment-status-pending">' + full.numberLike + ' Likes</span>';
                    // return_str += '<span class="mt-comment-status mt-comment-status-pending">Pending</span>';
                    return_str += '<ul class="mt-comment-actions">';
                    // return_str += '<li><a href="#">Quick Edit</a></li>';
                    // return_str += '<li><a href="#">View</a></li>';
                    return_str += '<li><a class="btn_delete_item" item_id=' + full.commentId + '>Delete</a></li>';
                    return_str += '</ul>';
                    return_str += '</div>';
                    return_str += '</div>';
                    return_str += '</div>';
                    return_str += '</div>';

                    //children comments
                    $(full.childrenComment).each(function(key, item) {
                        var c_ava = "/images/default_ava.jpg";
                        if (item.urlAvatar !== null) {
                            c_ava = item.urlAvatar;
                        }
                        var c_username = "Unknow";
                        if (item.firstName !== null && item.lastName !== null) {
                            c_username = item.firstName + ' ' + item.lastName;
                        }
                        var c_d = new Date(item.createOn);
                        var c_time = _month_names[c_d.getMonth()] + " " + c_d.getDate() + ', ' + c_d.getFullYear() + " " + c_d.getHours() + ":" + c_d.getMinutes() + ":" + c_d.getSeconds();
                        return_str += '<div class="mt-comments mt-children">';
                        return_str += '<div class="mt-comment">';
                        return_str += '<div class="mt-comment-img">';
                        return_str += '<img src="' + c_ava + '" /> </div>';
                        return_str += '<div class="mt-comment-body">';
                        return_str += '<div class="mt-comment-info">';
                        return_str += '<span class="mt-comment-author">' + c_username + '</span>';
                        return_str += '<span class="mt-comment-date">' + c_time + '</span>';
                        return_str += '</div>';
                        return_str += '<div class="mt-comment-text">' + item.content + '</div>';
                        return_str += '<div class="mt-comment-details">';
                        return_str += '<span class="mt-comment-status mt-comment-status-pending">' + item.numberLike + ' Likes</span>';
                        // return_str += '<span class="mt-comment-status mt-comment-status-pending">Pending</span>';
                        return_str += '<ul class="mt-comment-actions">';
                        // return_str += '<li><a href="#">Quick Edit</a></li>';
                        // return_str += '<li><a href="#">View</a></li>';
                        return_str += '<li><a class="btn_delete_item" item_id=' + item.commentId + '>Delete</a></li>';
                        return_str += '</ul>';
                        return_str += '</div>';
                        return_str += '</div>';
                        return_str += '</div>';
                        return_str += '</div>';
                    });
                    return return_str;
                }
            },
        ],
        "aoColumnDefs": [
            { "sWidth": "10%", 'aTargets': [0] },
        ],
        "autoWidth": false,
        "lengthChange": false,
        "info": false,
        "bSort": false,
        "bPaginate": true,
        "pagingType": "numbers",
        "fnDrawCallback": function(oSettings) {
            $("#page_datatable thead").remove();
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
                editing_item = obj_temp.id;
                $('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
                $('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
                $('#modal_add_edit .area_add_edit_item').val(obj_temp.description);
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
    $(".btn_add_new_item").click(function() {
        $('#modal_add_edit .modal-title').html("Create new " + item_name);
        $('#modal_add_edit .txt_add_edit_item_name').val();
        $('#modal_add_edit .btn_modal_save_new').show();
        $('#modal_add_edit .btn_modal_save_update').hide();
        $("#modal_add_edit").modal("show");
    });
    $('#page_datatable').on('order.dt', function() { console.log('Order'); })
        .on('search.dt', function() { console.log('Search'); })
        .on('page.dt', function() { console.log('paging'); })
        .dataTable();
};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();

    //event for modal
    $('.btn_modal_save_new').click(function() {
        console.log($(".select_status option:selected").val());
        _send_info.data = {
            "name": $(".txt_add_edit_item_name").val(),
            "status": $(".select_status option:selected").val(),
            "description": $(".area_add_edit_item").val(),
        };
        $.ajax({
            url: base_request_url + "/tags",
            type: "POST",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                console.log(data);
                $('#modal_add_edit').modal('hide');
                page_datatable.ajax.reload(null, false);
                if (data.statusCode == 'F') {
                    show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function() {
                        //action when click on notif
                    });
                } else {
                    show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function() {
                        //action when click on notif
                    });
                }
            },
            error: function(error) {
                show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    // $('.btn_modal_save_update').click(function() {
    //     console.log(editing_item);
    //     _send_info.data = {
    //         "name": $(".txt_add_edit_item_name").val(),
    //         "status": $(".select_status option:selected").val(),
    //         "description": $(".area_add_edit_item").val(),
    //         "id": editing_item
    //     };
    //     $.ajax({
    //         url: base_request_url + "/tags",
    //         type: "PUT",
    //         data: JSON.stringify(_send_info.data),
    //         contentType: "application/json",
    //         dataType: "json",
    //         beforeSend: function(xhr) {
    //             xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
    //         },
    //         success: function() {
    //             page_datatable.ajax.reload(null, false);
    //             $('#modal_add_edit').modal('hide');
    //             show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function() {
    //                 //action when click on notif
    //             });
    //         },
    //         error: function(error) {
    //             show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function() {
    //                 //action when click on notif
    //             });
    //         },
    //     });
    // });
    $('.btn_confirm_yes').click(function() {
        _send_info.data = {
            "commentId": deleted_id
        };
        $.ajax({
            url: base_request_url + "/commentArticle",
            type: "DELETE",
            data: JSON.stringify(_send_info.data),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function() {
                $('#modal_confirm').modal('hide');
                _send_info.data = {
                    "newsId": article_id
                };
                page_datatable.ajax.reload();
                $('#modal_add_edit').modal('hide');
                show_toast_notif("success", "Successfully", "Deleted: '" + $(".txt_add_edit_channel_name").val() + "'", function() {
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
    $('.select_status').change(function() {
        if ($(this).val() == 'active') {
            $('.select_status button').css('background-color', '#32c5d2');
        } else if ($(this).val() == 'inactive') {
            $('.select_status button').css('background-color', 'red');
        }
    });
});