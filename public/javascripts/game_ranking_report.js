var luckySpins = [];
var luckySpin = null;
var valueMinDate = 0;
var search_value = null;
var valueMaxDate = 0;
var dataTableRank = null;
var dataTableItem = null;
var Result = function() {
	$(".this_week").text(new Date().format('W'));
	$(".txt_filter_week_in_year").val(new Date().format('W') - 4);
	$(".search_submit").click(function(){
		if ($(".txt_filter_week_in_year").val() == ""
				|| $(".select_filter_game_ranking").val() == 0){
					show_toast_notif("error", "Fail", "Chưa chọn BXH hoặc Tuần");
					return;
				}
		viewData($(".select_filter_game_ranking").val(), $(".txt_filter_week_in_year").val());
	})

	$.ajax({
		url: base_request_url + "/admin/game-ranking",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$.each(data.data, function (key,value) {
				$(".select_filter_game_ranking").append('<option value="'+ value.id +'">' + value.name + '</option>')
			})
		},
		error: function (err) {
			console.log(err.error());
		}
	});
    
};

function viewData(id,week){
	// var table = $('#page_datatable').DataTable();
	if (dataTableRank != null) {
		$('#page_datatable_rank').DataTable().destroy();
	}

	if (dataTableItem != null) {
		$('#page_datatable_item').DataTable().destroy();
	}
	
	
	dataTableRank = $('#page_datatable_rank').DataTable({
		paging: false,
    	searching: false,
		"ajax": {
			"url": base_request_url + "/admin/game-ranking/report/rank?game_raking_id=" + id + "&week=" + week,
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
				// console.log(json)
				// var i = 0;
				// $(".datatable_paging_rank").html("");
				// if (json.totalRecords > _per_page) {
				// 	for (i = 1; i <= Math.ceil(json.totalRecords / _per_page); i++) {
				// 		if (i == _current_page) {
				// 			$(".datatable_paging_rank").append("<span class='datatable_paging_number_active' page=" + i + ">" + i + "</span>");
				// 		} else {
				// 			if (i == 1 || i == Math.ceil(json.totalRecords / _per_page) || i == (_current_page - 1) || i == (_current_page - 2) || i == (_current_page + 2) || i == (_current_page + 1)) {
				// 				if (i == 1 && _current_page > 4) {
				// 					$(".datatable_paging_rank").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 					$($(".datatable_paging_number")[0]).after("<span class='paging_truncate'>...</span>");
				// 				} else if (i == Math.ceil(json.totalRecords / _per_page) && _current_page < (Math.ceil(json.totalRecords / _per_page) - 3)) {
				// 					$(".datatable_paging_rank").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 					$($(".datatable_paging_number")[$(".datatable_paging_number").length - 1]).before("<span class='paging_truncate'>...</span>");
				// 				} else {
				// 					$(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 				}
				// 			}
				// 		}
				// 	}
				// } else {
				// 	$(".datatable_paging_rank").html("<span class='datatable_paging_number_active' page=" + 1 + ">" + 1 + "</span>");
				// }
				// $(".datatable_paging_number").click(function (e) {
				// 	_current_page = parseInt($(e.target).attr("page"));
				// 	page_datatable_rank.ajax.reload();
				// });
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
		responsive: true,
		"columns": [
			{ title: "Thứ Hạng", data: "potsition" },
			{ title: "Tên Nhân Vật", data: "userName" },
			{ title: "Server", data: "server" },
			{ title: "Rank", data: "rankName" },
			{ title: "Tổng Nạp", data: "scoin" }
		],
		"aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "5%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "15%", 'aTargets': [1] },
			{ responsivePriority: 3, "sWidth": "15%", 'aTargets': [2] },
			{ responsivePriority: 4, "sWidth": "15%", 'aTargets': [3] },
			{responsivePriority: 5, "sWidth": "15%", 'aTargets': [4] }
		],
		"autoWidth": true,
		"lengthChange": true,
		"info": false,
		"bSort": false,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {},
	});


	dataTableItem = $('#page_datatable_item').DataTable({
		paging: false,
    	searching: false,
		"ajax": {
			"url": base_request_url + "/admin/game-ranking/report/item?game_raking_id=" + id + "&week=" + week,
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
				// console.log(json)
				// var i = 0;
				// $(".datatable_paging_rank").html("");
				// if (json.totalRecords > _per_page) {
				// 	for (i = 1; i <= Math.ceil(json.totalRecords / _per_page); i++) {
				// 		if (i == _current_page) {
				// 			$(".datatable_paging_rank").append("<span class='datatable_paging_number_active' page=" + i + ">" + i + "</span>");
				// 		} else {
				// 			if (i == 1 || i == Math.ceil(json.totalRecords / _per_page) || i == (_current_page - 1) || i == (_current_page - 2) || i == (_current_page + 2) || i == (_current_page + 1)) {
				// 				if (i == 1 && _current_page > 4) {
				// 					$(".datatable_paging_rank").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 					$($(".datatable_paging_number")[0]).after("<span class='paging_truncate'>...</span>");
				// 				} else if (i == Math.ceil(json.totalRecords / _per_page) && _current_page < (Math.ceil(json.totalRecords / _per_page) - 3)) {
				// 					$(".datatable_paging_rank").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 					$($(".datatable_paging_number")[$(".datatable_paging_number").length - 1]).before("<span class='paging_truncate'>...</span>");
				// 				} else {
				// 					$(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
				// 				}
				// 			}
				// 		}
				// 	}
				// } else {
				// 	$(".datatable_paging_rank").html("<span class='datatable_paging_number_active' page=" + 1 + ">" + 1 + "</span>");
				// }
				// $(".datatable_paging_number").click(function (e) {
				// 	_current_page = parseInt($(e.target).attr("page"));
				// 	page_datatable_rank.ajax.reload();
				// });
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
			{ title: "Tên Nhân vật", data: "userName" },
			{ title: "Rank", data: "rankName" },
			{ title: "Phúc Lợi", data: "itemName" },
			{
				title: "Status",
				data: null,
				render: function (data, type, full, meta) {
					if (full.received == true) {
						data = "<div style='color:green'> Đã Nhận </div>";
					} else {
						data = "<div style='color:red'> Chưa Nhận </div>";
					}
					return data;
				}
			},
			{
				title: "Ngày Nhận",
				data: null,
				render: function (data, type, full, meta) {
					var str_date = null;
					if (full.receivedDate != null) {
						str_date = moment(full.receivedDate).format("YYYY-MMMM-D HH:mm");
					}
					return str_date;
				}
			}

		],
		"aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "20%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [1] },
			{ responsivePriority: 3, "sWidth": "20%", 'aTargets': [2] },
			{ responsivePriority: 4, "sWidth": "10%", 'aTargets': [3] },
			{ responsivePriority: 5, "sWidth": "10%", 'aTargets': [4] },
		],
		"autoWidth": true,
		"lengthChange": true,
		"info": false,
		"bSort": false,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {},
	});
}



if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        Result();
    });
}