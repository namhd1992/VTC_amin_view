//page variable
var editing_item = null;
var item_name = "shop item";
var item_names = "shop items";
var deleted_id = null;
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";
var img_array = [];
var imageCarosel = null;
var linkImage = null;
var linkOldImage = null;
var flagNewImage = false;

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

var load_page = function () {

	CKEDITOR.replace('des', {
		height: '300px',
	});
	var remove_img = function (img) {
		img_array.splice(img_array.indexOf(img), 1);
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

	$(".giftcode_group").hide();

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/shopingItem",
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
					// console.log("json.data.shopingItem", json.data.shopingItem)
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
		"columns": [{
			title: "ID",
			data: "shopingItem.id"
		},
		{
			title: "Name",
			data: "shopingItem.name"
		},
		{
			title: "Type",
			data: null,
			render: function (data, type, full, meta) {
				var str_data;
				switch (full.shopingItem.itemType) {
					case 1:
						str_data = "Normal";
						break;
					case 2:
						str_data = "Giftcode";
						break;
					case 3:
						str_data = "Event";
						break;
					default:
						break;
				}
				return str_data;
			}
		},
		{
			title: "Status",
			data: null,
			render: function (data, type, full, meta) {
				if (full.shopingItem.status == "active") {
					data = "<div class='active_status'>" + full.shopingItem.status + "</div>";
				} else {
					data = "<div class='inactive_status'>" + full.shopingItem.status + "</div>";
				}
				return data;
			}
		},
		{
			title: "Create On",
			data: null,
			render: function (data, type, full, meta) {
				var str_date = moment(full.shopingItem.createOn).format("YYYY-MMMM-D HH:mm");
				return str_date;
			}
		},
		{
			title: "Action",
			data: null,
			render: function (data, type, full, meta) {
				var return_str = "";
				return_str += "<a class='btn_edit_item' item_id='" + full.shopingItem.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
				return_str += "<a class='btn_delete_item' item_id='" + full.shopingItem.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
				return return_str;
			}
		}
		],
		"aoColumnDefs": [{
			"sWidth": "2%",
			'aTargets': [0]
		},
		{
			"sWidth": "10%",
			'aTargets': [1]
		},
		{
			"sWidth": "5%",
			'aTargets': [2]
		},
		{
			"sWidth": "3%",
			'aTargets': [3]
		},
		{
			"sWidth": "7%",
			'aTargets': [4]
		},
		{
			"sWidth": "10%",
			'aTargets': [5]
		},
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {
			$("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function () {
				return this.nodeType != 1;
			}).replaceWith("");

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				var shopingItem = obj_temp.shopingItem;
				var shopPromotion = obj_temp.promotion;
				editing_item = shopingItem.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + shopingItem.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(shopingItem.name);
				$('#modal_add_edit .txt_add_edit_item_quantity').val(shopingItem.quantity);
				if (shopingItem.itemType == 3) {
					$('#modal_add_edit .txt_add_edit_item_package_id').val(shopingItem.packageId);
				}
				$('#modal_add_edit .txt_add_edit_item_price').val(shopingItem.price);
				$('#modal_add_edit #single_select_coin_type').val(shopingItem.coinType);
				$('#modal_add_edit .txt_add_edit_item_gender').val(shopingItem.firstType);
				$('#modal_add_edit .txt_add_edit_item_category').val(shopingItem.secondType);
				$('#modal_add_edit .txt_add_edit_item_des').val(shopingItem.description);
				$('#modal_add_edit .uploaded_giftcode').val(shopingItem.urlGiftcodeFile);
				$('#modal_add_edit #single_select_hot_title').val(shopingItem.hotTitle);
				$('#modal_add_edit #single_select_item_type').val(shopingItem.itemType);
				$('#modal_add_edit #single_select_shop').val(shopingItem.shopId);
				$('#modal_add_edit #single_select_gender').val(shopingItem.firstType);
				$('#modal_add_edit #single_select_category').val(shopingItem.secondType);
				$('#modal_add_edit .image_item_icon').html("<img src=" + shopingItem.defaultImage + " />");
				$('#modal_add_edit .image_item_big_image').html("<img src=" + shopingItem.bigImage + " />");
				if (shopingItem.itemType == 2) {
					$(".giftcode_group").show();
					$(".form-package").hide();
				} else if (shopingItem.itemType == 3) {
					$(".form-package").show();
					$(".giftcode_group").hide();
				} else {
					$(".giftcode_group").hide();
					$(".form-package").hide();
				}

				if (shopingItem.urlGiftcodeFile != "") {
					$('#modal_add_edit .image_item_giftcode').html("<img src='http://icons.iconarchive.com/icons/alecive/flatwoken/128/Apps-Google-Drive-Sheets-icon.png' />");
				} else {
					$('#modal_add_edit .image_item_giftcode').html("");
				}
				if (CKEDITOR.instances.des !== undefined) {
					CKEDITOR.instances.des.destroy();
				}
				CKEDITOR.replace('des', {
					height: '300px',
				});
				CKEDITOR.instances.des.setData(shopingItem.description);
				$(".image_item").html("");
				img_array = [];
				if (shopingItem.screenShot !== null) {
					$.each(shopingItem.screenShot.split(","), function (key, item) {
						if (item !== "") {
							$(".image_item").append(" <img class='remove_image' src='" + item + "' />");
							img_array.push(item);
						}
					});
				}
				$(".remove_image").click(function () {
					remove_img($(this).attr("src"));
					$(this).remove();
				});
				$('#single_select_shop').val(shopingItem.shopId);
				load_autocomplete_component();
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				$(".select_status option").filter(function () {
					return $.trim($(this).val()) == shopingItem.status;
				}).prop('selected', true);
				$('.select_status').selectpicker('refresh');
				if (shopingItem.status == 'active') {
					$('.select_status button').css('background-color', '#32c5d2');
				} else {
					$('.select_status button').css('background-color', 'red');
				}

				if (shopingItem.hasPromotion){
					$("[name='my-checkbox']").bootstrapSwitch('state', ':checked');
					$(".form-promotion input, .form-promotion select").removeAttr('disabled');
					$("#promotion_select").val(shopPromotion.shopPromotion);
					$(".txt_promotion_tag_view").val(shopPromotion.tagView);
					$(".txt_promotion_price").val(shopPromotion.newPrice);
					$(".txt_promotion_quantity").val(shopPromotion.quantity);
				} else {
					$("[name='my-checkbox']").bootstrapSwitch('state', '');
					$(".form-promotion input, .form-promotion select").attr('disabled','disabled');
					$(".form-promotion input, .form-promotion select").val("");
				}
				load_autocomplete_component();
				$('.btn_delete_item').show();
				$('.btn_delete_item').attr("item_id", shopingItem.id);
				$('#modal_add_edit').modal('show');

				$(".txt_promotion_tag_view").change(function(){
					if($('input[name="is_sale_percent"]').prop('checked')) {
						if(Number.isNaN(shopingItem.price/$('.txt_promotion_tag_view').val())){
							show_toast_notif("error", "Error", "Sai định dạng % sale off", function () {});
							$('#is_sale_percent').parent().removeClass('checked');
							return;
						}
						$(".txt_promotion_price").val(Math.round((shopingItem.price/$('.txt_promotion_tag_view').val()) * 1)/1);
					}
				});

				$('input[name="is_sale_percent"]').change(function (){
					if($(this).prop('checked')) {
						if(Number.isNaN(shopingItem.price/$('.txt_promotion_tag_view').val())){
							show_toast_notif("error", "Error", "Sai định dạng % sale off", function () {});
							$('#is_sale_percent').parent().removeClass('checked');
							return;
						}
						$(".txt_promotion_price").attr("disabled","disabled");
						$(".txt_promotion_price").val(Math.round((shopingItem.price/$('.txt_promotion_tag_view').val()) * 1)/1);
					} else {
						$(".txt_promotion_price").removeAttr("disabled");
					}
				});

				if($(".txt_promotion_price").val() == Math.round((shopingItem.price/$('.txt_promotion_tag_view').val()) * 1)/1) {
					$('#is_sale_percent').parent().addClass('checked');
					$(".txt_promotion_price").attr("disabled","disabled");
				} else {
					$('#is_sale_percent').parent().removeClass('checked');
					$(".txt_promotion_price").removeAttr("disabled");
				}
			});
			$('.btn_delete_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				var shopingItem = obj_temp.shopingItem;
				deleted_obj = shopingItem;
				deleted_id = shopingItem.id;
				$("#modal_confirm").modal("show");
			});
		},
	});
	$(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function () {
		if ($(this).parents("[class*='has-']").length) {
			var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);

			for (var i = 0; i < classNames.length; ++i) {
				if (classNames[i].match("has-")) {
					$("body > .select2-container").addClass(classNames[i]);
				}
			}
		}
	});

	load_autocomplete_component = function () {
		$.fn.select2.defaults.set("theme", "bootstrap");

		var placeholder = "Please! Select";

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
				data: function (params) {
					return {
						q: params.term,
						page: params.page
					};
				},
				processResults: function (data, page) {
					return {
						results: data.items
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) {
				return markup;
			},
			minimumInputLength: 1,
			templateResult: formatRepo,
			templateSelection: formatRepoSelection
		});

		$("button[data-select2-open]").click(function () {
			$("#" + $(this).data("select2-open")).select2("open");
		});

		$(":checkbox").on("click", function () {
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

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
	};

	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});

	//event for modal
	$(".btn_add_new_item").click(function () {
		$(".image_item").html("");
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit input:text').val("");
		$('#modal_add_edit textarea').val("");
		$('#modal_add_edit .txt_add_edit_item_start_amount').val(1);
		$('#modal_add_edit .txt_add_edit_item_price_step').val(1);
		$('#modal_add_edit .image_item_icon').html("");
		$('#modal_add_edit .image_item_big_image').html("");
		$('#modal_add_edit .image_item').html("");
		if (CKEDITOR.instances.des !== undefined) {
			CKEDITOR.instances.des.destroy();
		}
		CKEDITOR.replace('des', {
			height: '300px',
		});
		CKEDITOR.instances.des.setData("");
		$(".select_status option").filter(function () {
			return $.trim($(this).val()) == "active";
		}).prop('selected', true);
		$('.select_status').selectpicker('refresh');
		$('.select_status button').css('background-color', '#32c5d2');
		load_autocomplete_component();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});
	$('.btn_confirm_yes').click(function () {
		$.ajax({
			url: base_request_url + "/admin/shopingItem?id=" + deleted_id,
			type: "DELETE",
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_confirm').modal('hide');
				_send_info.data = {};
				page_datatable.ajax.reload();
				$('#modal_add_edit').modal('hide');
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function () {
				});
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
				});
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required");
			return;
		}

		if ($("#single_select_item_type").val() == 3 
				&& $(".txt_add_edit_item_package_id").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " Chưa điền Package id");
			return;
		}
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"hotTitle": $("#single_select_hot_title").val(),
			"packageId": $(".txt_add_edit_item_package_id").val(),
			"price": $(".txt_add_edit_item_price").val(),
			"coinType": $("#single_select_coin_type").val(),
			"quantity": $(".txt_add_edit_item_quantity").val(),
			"shopId": $("#single_select_shop").val(),
			"defaultImage": $(".image_item_icon img").attr("src"),
			"bigImage": $(".image_item_big_image img").attr("src"),
			"firstType": $("#single_select_gender").val(),
			"secondType": $("#single_select_category").val(),
			"description": CKEDITOR.instances.des.getData(),
			"screenShot": img_array.toString(),
			"itemType": $("#single_select_item_type").val(),
			"urlGiftcodeFile": $(".uploaded_giftcode").val(),
			"status": $(".select_status option:selected").val(),
			"hasPromotion" : $("[name='my-checkbox']").bootstrapSwitch('state')
		};

		if($("[name='my-checkbox']").bootstrapSwitch('state') == true) {
			if(!validateFormShopItemPromotion()) {
				return;
			}
			_send_info.data.promotion = {
				"promotionId" : $("#promotion_select").val(),
				"tagView" : $(".txt_promotion_tag_view").val(),
				"newPrice" : $(".txt_promotion_price").val(),
				"shopItem" : editing_item,
				"quantity" : $(".txt_promotion_quantity").val()
			}
		}
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/shopingItem",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () {
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
				});
				$(".loading_icon").hide();
			},
		});
	});

	$('#single_select_item_type').change(function(){
		if ($(this).val() == 2) {
			$(".giftcode_group").show();
			$(".form-package").hide();
		} else if ($(this).val() == 3) {
			$(".form-package").show();
			$(".giftcode_group").hide();
		} else {
			$(".giftcode_group").hide();
			$(".form-package").hide();
		}
	})

	$('.btn_modal_save_update').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " name is required");
			return;
		}

		if ($("#single_select_item_type").val() == 3 
				&& $(".txt_add_edit_item_package_id").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " Chưa điền Package id");
			return;
		}

		

		
		_send_info.data = {
			"id": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"hotTitle": $("#single_select_hot_title").val(),
			"packageId": $(".txt_add_edit_item_package_id").val(),
			"price": $(".txt_add_edit_item_price").val(),
			"coinType": $("#single_select_coin_type").val(),
			"quantity": $(".txt_add_edit_item_quantity").val(),
			"shopId": $("#single_select_shop").val(),
			"defaultImage": $(".image_item_icon img").attr("src"),
			"bigImage": $(".image_item_big_image img").attr("src"),
			"firstType": $("#single_select_gender").val(),
			"secondType": $("#single_select_category").val(),
			"description": CKEDITOR.instances.des.getData(),
			"screenShot": img_array.toString(),
			"itemType": $("#single_select_item_type").val(),
			"urlGiftcodeFile": $(".uploaded_giftcode").val(),
			"status": $(".select_status option:selected").val(),
			"hasPromotion" : $("[name='my-checkbox']").bootstrapSwitch('state')
		};
		if($("[name='my-checkbox']").bootstrapSwitch('state') == true) {
			if(!validateFormShopItemPromotion()) {
				return;
			}
			_send_info.data.promotion = {
				"promotionId" : $("#promotion_select").val(),
				"tagView" : $(".txt_promotion_tag_view").val(),
				"newPrice" : $(".txt_promotion_price").val(),
				"shopItem" : editing_item,
				"quantity" : $(".txt_promotion_quantity").val()
			}
		}
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/shopingItem",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () {
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () {
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
				});
				$(".loading_icon").hide();
			},
		});
	});
	$('.select_status').change(function () {
		if ($(this).val() != "") {
			if ($(this).val() == 'active') {
				$('.select_status button').css('background-color', '#32c5d2');
			} else if ($(this).val() == 'inactive') {
				$('.select_status button').css('background-color', 'red');
			}
			$(".hidden_item_status").val($(this).val());
		}
	});
	$('#single_select_item_type').change(function () {
		if ($(this).val() != "") {
			if ($(this).val() == 2) {
				$(".giftcode_group").show();
			} else {
				$(".giftcode_group").hide();
			}
		}
	});
	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		$('.search_input').val("");
		search_value = "";
		page_datatable.ajax.reload(null, false);
	});
	$(".form_datetime").datetimepicker({
		autoclose: true,
		isRTL: App.isRTL(),
		format: "yyyy-MM-dd HH:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});
	$.ajax({
		url: base_request_url + "/admin/shoping",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				$("#single_select_shop").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});
	$('.btn_modal_upload_giftcode').click(function () {
		$(".loading_icon").show();
		var formData = new FormData($('#form_upload_giftcode')[0]);
		$.ajax({
			url: base_request_url + "/admin/uploadFile",
			type: "POST",
			data: formData,
			cache: false,
			contentType: false,
			timeout: 3000000,
			processData: false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Uploaded ");
					img_array.push(data.dataObj);
					$('#modal_add_edit .image_item_giftcode').html("<img src='http://icons.iconarchive.com/icons/alecive/flatwoken/128/Apps-Google-Drive-Sheets-icon.png' />");
					$('.uploaded_giftcode').val(data.dataObj);
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage);
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
				$(".loading_icon").hide();
			}
		});
	});
	$('.btn_modal_upload').click(function () {
		$(".loading_icon").show();
		var formData = new FormData($('#form_upload')[0]);
		$.ajax({
			url: base_request_url + "/admin/uploadFile",
			type: "POST",
			data: formData,
			cache: false,
			contentType: false,
			timeout: 3000000,
			processData: false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Uploaded ");
					img_array.push(data.dataObj);
					$('#modal_add_edit .image_item').append("<img src='" + data.dataObj + "' />");
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage);
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
				$(".loading_icon").hide();
			}
		});
	});
	$('.btn_modal_upload_icon').click(function () {
		var viewImage = $(this).parent().parent().parent()
		.next().children().next().children().children();
		linkImage = null;
		$(".loading_icon").show();
		uploadImageCarousel(viewImage);
		if(linkImage == null){
			show_toast_notif("error", "Có lỗi khi upload ảnh");
			return;
		}
		$('#modal_add_edit .image_item_icon').html("<img src=" + linkImage + " />");
	});

	$('.btn_modal_upload_big_image').click(function () {
		var viewImage = $(this).parent().parent().parent()
		.next().children().next().children().children();
		linkImage = null;
		$(".loading_icon").show();
		uploadImageCarousel(viewImage);
		if(linkImage == null){
			show_toast_notif("error", "Có lỗi khi upload ảnh");
			return;
		}
		$('#modal_add_edit .image_item_big_image').html("<img src=" + linkImage + " />");
	});

	$(".txt_add_edit_item_upload").change(function(){
		var viewImage = $(this).parent().parent().parent()
		.next().children().next().children();

		linkOldImage = null;
		linkImage = null;
		flagNewImage = false;
		imageCarosel = null;
		var image = this.files[0];
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
				linkOldImage = viewImage.children().attr("src");
				viewImage.html("<img src=" + URL.createObjectURL(this.files[0]) + " />");
				imageCarosel = this.files[0];
				flagNewImage = true;
		} else {
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
		}
	});

	function uploadImageCarousel(btFile){
		if(flagNewImage) {
			
			var formData = new FormData();
			formData.append('image', imageCarosel);
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
					// page_datatable.ajax.reload(null, false);
					if (data.status == '01') {
						console.log(data);
						// show_toast_notif("success", "Successfully", "Upload image success");
						linkImage = data.data;
						deleteImageCarousel(btFile);
					} else {
						show_toast_notif("error", "Fail", "Upload Image Unsuccess");
					}
					$(".loading_icon").hide();
				},
				error: function (error) {
					show_toast_notif("error", "Fail", "Error '" + error.message + "'");
					$(".loading_icon").hide();
				},
			});
		} 
	}
	
	function deleteImageCarousel(btFile){
		if(flagNewImage) {
	
			_send_info.data = {
				"urlImage" : linkOldImage
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
						console.log(data);
						show_toast_notif("success", "Successfully", "Add new and Delete old image success");
					} else {
						show_toast_notif("error", "Fail", data.message);
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

	$.ajax({
		url: base_request_url + "/admin/shopingPromotion",
		type: "GET",
		cache: false,
		contentType: false,
		timeout: 3000000,
		processData: false,
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			if (data.statusCode == 'T') {
				console.log("data", data.dataArr);
				$.each(data.dataArr, function(index, value){
					$("#promotion_select").append("<option value='" + value.id + "'> " + value.name + "</option>");
				});
				
			} else {
				show_toast_notif("error", "Fail", data.onlyMessage);
			}
			$(".loading_icon").hide();
		},
		error: function (error) {
			show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
			$(".loading_icon").hide();
		}
	});

	$("[name='my-checkbox']").on('switchChange.bootstrapSwitch', function (event, state) {
		if(!state) {
			$(".form-promotion input, .form-promotion select").attr('disabled','disabled');
		} else {
			$(".form-promotion input, .form-promotion select").removeAttr('disabled');
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

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$("[name='my-checkbox']").bootstrapSwitch();
});