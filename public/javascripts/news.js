//page variable
var editing_item = null;
var item_name = "Article";
var item_names = "Articles";
var deleted_id = null;
var page_datatable = null;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var load_page = function() {

    //ajax get all channels
    _send_info.data = {
        "limit": 10000,
        "offset": 0,
    };

    $('.bs-select').selectpicker({
        iconBase: 'fa',
        tickIcon: 'fa-check'
    });

    page_datatable = $('#page_datatable').DataTable({
        ajax: {
            "url": base_request_url + "/allNewFeeds",
            "type": "POST",
            "data": function(d) {
                return JSON.stringify(_send_info.data);
            },
            "contentType": "application/json",
            "dataType": "json",
            "dataSrc": function(json) {
                console.log(json);
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
        columns: [{
            title: "News",
            data: null,
            render: function(data, type, full, meta) {
                var news_title = full.title;
                var news_content = full.title;
                var news_img = full.defaultImage;
                var d = new Date(full.createOn);
                var news_date = _month_names[d.getMonth()] + " " + d.getDate() + ', ' + d.getFullYear();
                var news_str = "";
                news_str += '<ul>';
                news_str += '<li class="mt-list-item">';
                news_str += '<div class="list-icon-container">';
                news_str += "<a class='btn-link btn_edit_item btn btn-primary' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
                news_str += '<a href="new_details?id=' + full.id + '" class="btn-link btn btn-primary" ><i class="icon-bubbles"></i> Comments (' + full.numberComment + ') </a>';
                news_str += '</div>';
                news_str += '<div class="list-thumb">';
                news_str += '<a href="javascript:;">';
                news_str += '<img alt="" src=' + news_img + ' />';
                news_str += '</a>';
                news_str += '</div>';
                news_str += '<div class="list-datetime bold uppercase font-red">' + news_date + '</div>';
                news_str += '<div class="list-item-content">';
                // news_str += "<h3 class=\"uppercase\">";
                // news_str += "<a href=\"javascript:;\">" + news_title + "<\/a>";  
                // news_str += "<\/h3>";
                news_str += '<div>' + news_content + '</div>';
                news_str += '</div>';
                news_str += '</li>';
                news_str += '</ul>';
                return news_str;
            }
        }, ],
        "aoColumnDefs": [
            { "sWidth": "100%", 'aTargets': [0] },
        ],
        "autoWidth": false,
        "lengthChange": false,
        "info": false,
        "bSort": false,
        "bPaginate": true,
        "pagingType": "numbers",
        "fnDrawCallback": function(oSettings) {
            $(".mt-list-item").mouseover(function() {
                $(this).find(".list-icon-container").show();
            });
            $(".mt-list-item").mouseout(function() {
                $(this).find(".list-icon-container").hide();
            });
            $("#page_datatable thead").remove();
            $("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function() {
                return this.nodeType != 1;
            }).replaceWith("");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("form-control");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-inline");
            $("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-medium");
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("placeholder", 'Search...');
            $("div.dataTables_wrapper div.dataTables_filter label input").attr("id", 'inputSuccess');
            $("#page_datatable tbody").addClass("mt-list-container list-news ext-1");
            $("#page_datatable").addClass("mt-element-list");

            // event for all component inside datatable
            $(".btn_edit_item").click(function() {
                var obj_temp = JSON.parse($(this).attr("item_obj"));
                editing_item = obj_temp.id;
                $('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.id);
                $('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.title);
                $('#modal_add_edit .txt_add_edit_item_img').val(obj_temp.defaultImage);
                // $('#modal_add_edit .btn_modal_save_new').hide();
                // $('#modal_add_edit .btn_modal_save_update').show();
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
    // $('.btn_modal_save_new').click(function() {
    //     console.log($(".select_status option:selected").val());
    //     _send_info.data = {
    //         "name": $(".txt_add_edit_item_name").val(),
    //         "status": $(".select_status option:selected").val(),
    //         "description": $(".area_add_edit_item").val(),
    //     };
    //     $.ajax({
    //         url: base_request_url + "/tags",
    //         type: "POST",
    //         data: JSON.stringify(_send_info.data),
    //         contentType: "application/json",
    //         dataType: "json",
    //         beforeSend: function(xhr) {
    //             xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
    //         },
    //         success: function(data) {
    //             console.log(data);
    //             $('#modal_add_edit').modal('hide');
    //             page_datatable.ajax.reload(null, false);
    //             if (data.statusCode == 'F') {
    //                 show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function() {
    //                     //action when click on notif
    //                 });
    //             } else {
    //                 show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function() {
    //                     //action when click on notif
    //                 });
    //             }
    //         },
    //         error: function(error) {
    //             show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function() {
    //                 //action when click on notif
    //             });
    //         },
    //     });
    // });
    $('.btn_modal_save_update').click(function() {
        console.log(editing_item);
        _send_info.data = {
            "title": $(".txt_add_edit_item_name").val(),
            "status": $(".select_status option:selected").val(),
            "defaultImage": $(".txt_add_edit_item_img").val(),
            "newsId": editing_item
        };
        $.ajax({
            url: base_request_url + "/article",
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
                page_datatable.ajax.reload();
                $('#modal_add_edit').modal('hide');
                show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function() {
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
    $('.select_status').change(function() {
        if ($(this).val() == 'active') {
            $('.select_status button').css('background-color', '#32c5d2');
        } else if ($(this).val() == 'inactive') {
            $('.select_status button').css('background-color', 'red');
        }
    });
});