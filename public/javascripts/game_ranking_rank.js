//page variable
var editing_item = null;
var search_value = null;
var game_raking = null;
var page_datatable = null;
var deleted_obj = null;
var deleted_id =null;
_current_page = 1;
var imageLogo = null;
var linkImage = null;

var Page_script = function () {
	return {
		//main function
		init: function () {
		},
	};
}();

function str_pad(n) {
	return String("00" + n).slice(-2);
}

_send_info.data = {
	limit: 1000,
	offset: 0
};

var load_page = function () {
	
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
			"url": base_request_url + "/admin/game-ranking-rank?game_ranking_id=" + game_ranking_id,
			"type": "GET",
			"data": function (d) {
				if (search_value != null && search_value != "") {
					d.searchValue = search_value;
				}
				d.limit = _per_page;
				d.offset = _per_page * (_current_page - 1);
			},
			"contentType": "application/json",
			"dataType": "json",
			"dataSrc": function (json) {
                console.log(json)
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
				$(".datatable_paging_number").click(function (e) {
					_current_page = parseInt($(e.target).attr("page"));
					page_datatable.ajax.reload();
				});
				if (json.data != null) {
					return json.data;
				} else {
					return [];
				}
			},
			"beforeSend": function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			"error": function (xhr, error, thrown) {
				if (JSON.parse(xhr.responseText).error == "invalid_token") {
					localStorage.removeItem("user_data");
					document.location.replace("login");
				}
			},
        },
        responsive: false,
        "columns": [
			{ title: "ID", data: "id" },
			{
				title: "Icon",
				data: null,
				render: function (data, type, full, meta) {
					var return_str = "";
					return_str += "<img src='"+ full.rankIconUrl + "' style='height: 40px;width: 40px'>"
					return return_str;
				}
			},
			{ title: "Rank Name", data: "rankName" },
			{ title: "Thứ Hạng", data: "rankPosition" },
			{ title: "Số Lượng Rank", data: "rankQuantity" },
			{
				title: "Create On",
				data: null,
				render: function (data, type, full, meta) {
					var str_date = moment(full.createOn).format("YYYY-MMMM-D HH:mm");
					return str_date;
				}
			},
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					var return_str = "";
					return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					return_str += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return_str += "<a class='btn_edit_item' href='/game_ranking_item?rank_id=" + full.id + "&game_ranking_id=" + game_ranking_id + "'><i class='icon-wrench'></i> Quản Lý Phúc Lợi </a>";
					return return_str;
				}
			}
        ],
        "aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "3%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [1] },
			{ responsivePriority: 3, "sWidth": "25%", 'aTargets': [2] },
			{ responsivePriority: 4, "sWidth": "12%", 'aTargets': [3] },
			{ responsivePriority: 5, "sWidth": "10%", 'aTargets': [4] },
			{ responsivePriority: 6, "sWidth": "20%", 'aTargets': [5] },
			{ responsivePriority: 7, "sWidth": "25%", 'aTargets': [6] },
        ],
        "autoWidth": true,
		"lengthChange": true,
		"info": false,
		"bSort": true,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {

			// ========================= FORM EDIT EVENT GAME=========================
			
			$(".btn_edit_item").click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_item = obj_temp.id;

				// generate data to form edit
				$(".txt_add_edit_item_name").val(obj_temp.rankName);
				$('#modal_add_edit .txt_add_edit_item_link_logo').text("");
				$('#modal_add_edit .logo_img').css("background-image","url(" + obj_temp.rankIconUrl + ")");
				$('#modal_add_edit .txt_add_edit_item_link_logo').text(obj_temp.rankIconUrl);
				$(".txt_add_edit_item_position").val(obj_temp.rankPosition);
				$(".txt_add_edit_item_quantity").val(obj_temp.rankQuantity);
				// $(".txt_add_edit_item_description").val(obj_temp.decription);


				 //set status
				// $(".select_status option").filter(function() {
                //     return $.trim($(this).val()) == obj_temp.status;
                // }).prop('selected', true);
                // $('.select_status').selectpicker('refresh');

                // if (obj_temp.status == 'active') {
                //     $('.select_status button').css('background-color', '#32c5d2');
                // } else {
                //     $('.select_status button').css('background-color', 'red');
				// }

				// $(".item_clone").remove();
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				$('#modal_add_edit').modal('show');
				
				$(".item_clone").remove();
				if (obj_temp.gameRankingItems != null) {
					$.each( obj_temp.gameRankingItems, function (key, item) {
						$(".item_detail").children(".item_name").html("");
						var rankClone = $(".item_detail").clone();
						rankClone.removeClass("item_detail");
						rankClone.addClass("item_clone");
						rankClone.children(".item_name").html(item.itemName);
						rankClone.children(".item_type").html(item.itemType);
						rankClone.children(".item_quantity").html(item.itemQuantity);
						$(".item_group").append(rankClone);
					});
					$(".item_detail").hide()
					$(".item_clone").show();
				}

				$(".btn_rank_manager").attr("href", "/game_ranking_item?rank_id=" + obj_temp.id + "&game_ranking_id=" + game_ranking_id);
			});

			$('.btn_delete_item').click(function() {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				deleted_obj = obj_temp;
				deleted_id = obj_temp.id;
				$("#modal_confirm").modal("show");
			});
		},
	});

	$(".txt_add_edit_item_file_logo").change(function(){
		var image = this.files[0];
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
			imageLogo = this.files[0];
			$('#modal_add_edit .txt_add_edit_item_image_logo').css("background-image","url(" + URL.createObjectURL(imageLogo) + ")");
			flagNewImage = true;
			$(".txt_add_edit_item_file_logo").val('');
		} else {
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
			imageLogo = null;
		}
	});

	$(".btn_modal_upload_image_logo").click(function (){
		uploadImageGame(imageLogo);
		if (linkImage == null){
			show_toast_notif("error", "Lỗi Tải Ảnh", "Chưa chọn ảnh", function () { });
		} else {
			$('#modal_add_edit .txt_add_edit_item_link_logo').html(linkImage);
			linkImage = null;
		}
	});

	// $('#modal_add_edit .btn_modal_save_update').show();
	// $('#modal_add_edit').modal('show');

	//Change status
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
	
	// ========================= FORM ADD NEW GAME RANKING=========================

	$(".btn_add_new_item").click(function () {
		$('#add_edit_game_ranking_form').trigger("reset");
		$(".item_clone").remove();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('#modal_add_edit').modal('show');

		// Call to API Add Event Game
		$("#modal_add_edit .btn_modal_save_new").click(function () {
			createOrUpdateGameRankingRank("CREATE");
		})
	});

	$("#modal_add_edit .btn_modal_save_update").click(function () {
		createOrUpdateGameRankingRank("UPDATE");
	});
	function createOrUpdateGameRankingRank(type){

		_send_info.data = {
			"id": editing_item,
			"gameRankingId": game_ranking_id,
			"rankName": $(".txt_add_edit_item_name").val(),
			"rankPosition" : $(".txt_add_edit_item_position").val(),
			"rankIconUrl": $(".txt_add_edit_item_link_logo").text(),
			"rankQuantity": $(".txt_add_edit_item_quantity").val(),
			"description" : $(".txt_add_edit_item_description").val(),
			"status": $(".select_status option:selected").val()
		};

		var method = "";

		switch (type) {
			case "CREATE":
				editing_item = null;
				method = "POST"
				break;
			case "UPDATE":
				method = "PUT"
				break;
		
			default:
				break;
		}

		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/game-ranking-rank",
			type: method,
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () { });
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
			console.log(_send_info.data);
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});
	}

	$('.btn_confirm_yes').click(function() {
        $.ajax({
            url: base_request_url + "/admin/game-ranking-rank?id=" + deleted_id,
            type: "DELETE",
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
                show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function() {});
            },
            error: function(error) {
                show_toast_notif("error", "Error", "'" + error.responseText + "'", function() {});
            },
        });
    });
		
	
	// ========================== SUPORT AND OTHER ACTION ========================

	// select game or other service -> service id
	$("#single_select_game").change(function(){
		var serviceId = $("#single_select_game").val();
		if (serviceId != 0) {
			$(".txt_add_edit_service_id").attr("disabled","disable")
		} else {
			$(".txt_add_edit_service_id").removeAttr("disabled")
		}         
		console.log(serviceId);
		$(".txt_add_edit_service_id").val(serviceId);
	});
	$.ajax({
		url: base_request_url + "/admin/game-ranking/" + game_ranking_id,
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			game_raking = data.data;
			$(".ranking_name").text(game_raking.name);
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	function uploadImageGame(image){
		if(flagNewImage 
			&& image != null
			&& image != undefined) {
			var formData = new FormData();
			formData.append('image', image);
	
			$(".loading_icon").show();
			$.ajax({
				url: base_request_url + "/admin/uploadImage",
				type: "POST",
				data: formData,
				cache: false,
				async: false,
				contentType: false,
				timeout: 3000000,
				processData: false,
				
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
				},
				success: function (data) {
					if (data.status == '01') {
						linkImage = data.data;
						deleteImageGame($('#modal_add_edit .txt_add_edit_item_link_logo').html());
						$(".loading_icon").hide();
						show_toast_notif("success", "Successfully", "Add new image success");
						
					} else {
						$(".loading_icon").hide();
						show_toast_notif("error", "Fail", "Upload Image Unsuccess");
					}
				},
				error: function (error) {
					show_toast_notif("error", "Fail", "Error '" + error.message + "'");
					$(".loading_icon").hide();
				},
			});
		} 
	}
	
	function deleteImageGame(urlImage){
		if(flagNewImage) {
	
			_send_info.data = {
				"urlImage" : urlImage
			}
	
			$.ajax({
				url: base_request_url + "/admin/deleteImage",
				type: "POST",
				data: JSON.stringify(_send_info.data),
				cache: false,
				async: false,
				contentType: "application/json",
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
				},
				success: function (data) {
					page_datatable.ajax.reload(null, false);
					if (data.status == '01') {
						flagNewImage = false;
						$(".loading_icon").hide();
						show_toast_notif("success", "Successfully", "Add new and Delete old image success");
					} else {
						show_toast_notif("error", "Fail", "Delete Image Unsuccess");
						$(".loading_icon").hide();
					}
				},
				error: function (error) {
					show_toast_notif("error", "Fail", "Error '" + error.message + "'");
					$(".loading_icon").hide();
				},
			});
		} 
	}

}

jQuery(document).ready(function () {
	Page_script.init();
	load_page();

});