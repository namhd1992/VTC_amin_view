//page variable
var editing_item = null;
var item_name = "Spin";
var item_names = "Spins";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
var search_value;
var default_items = [];
var load_autocomplete_component;
_current_page = 1;
_per_page = 5;
var item_list = [];
var doneTypingInterval = 1000;
var searching_value_timeout = "";
var typingTimer;
var publisher_id = null;
var item_count = 2;
var pair_count = 1;
var spinType = null;
var spin_item_list = [];
var turnoverLandmarkList=[];
var turnoverLandmarkIdDeletes= [];

var Page_script = function () {
	return {
		//main function
		init: function () { },
	};
}();

function str_pad(n) {
	return String("00" + n).slice(-2);
}
var des = new FroalaEditor('textarea#froala-editor');

var load_page = function () {

	$(".loading_icon").show();
	_send_info.data = {
		"limit": _per_page,
		"offset": 0,
	};

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/luckySpin",
			"type": "GET",
			"data": function (d) {
				d.limit = _per_page;
				d.offset = _per_page * (_current_page - 1);
				if (search_value != null && search_value != "") {
					d.searchValue = search_value;
				}
				if (publisher_id != null && publisher_id != "") {
					d.publisherId = publisher_id;
				}
				return d;
			},
			"contentType": "application/json",
			"dataType": "json",
			"dataSrc": function (json) {
				console.log(json);
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
				return json.data;
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
		"columns": [
			{ title: "ID", data: "id" },
			{ title: "Name", data: "name" },
			{ title: "Spin times", data: "spinTimes" },
			{
				title: "Start date",
				data: null,
				render: function (data, type, full, meta) {
					var format = getSetting(_setting_data, "date_format");
					var news_date = moment.unix(full.startDate / 1000).format(format.value);
					return news_date;
				}
			},
			{
				title: "End date",
				data: null,
				render: function (data, type, full, meta) {
					var format = getSetting(_setting_data, "date_format");
					var news_date = moment.unix(full.endDate / 1000).format(format.value);
					return news_date;
				}
			},
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					data = "";
					data += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					data += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return data;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "10%", 'aTargets': [1] },
			{ "sWidth": "5%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "15%", 'aTargets': [4] },
			{ "sWidth": "15%", 'aTargets': [5] },
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bPaginate": false,
		"bFilter": false,
		"fnDrawCallback": function (oSettings) {
			$("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function () {
				return this.nodeType != 1;
			}).replaceWith("");
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("form-control");
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-inline");
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-medium");
			$("div.dataTables_wrapper div.dataTables_filter label input").attr("placeholder", 'Search...');
			$("div.dataTables_wrapper div.dataTables_filter label input").attr("id", 'inputSuccess');

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				$("#add_giftcode_form").trigger('reset');
				$('#modal_add_edit input:file').val("");
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_item = obj_temp.id;
				console.log(obj_temp);
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('.txt_add_edit_item_name').val(obj_temp.name);
				$('#single_select_type_spin').val(obj_temp.type);
				$('#review_image_text').attr("src",obj_temp.image);
				$("#link_image_text").html(obj_temp.image);
				des.html.set(obj_temp.description);
				// $('.area_add_edit_item_desc').val(obj_temp.description);
				$('.txt_add_edit_item_link_live_stream').val(obj_temp.linkLiveStream);
				$('.txt_add_edit_item_free_per_day').val(obj_temp.freeSpinPerDay);
				$('.txt_add_edit_item_free_on_start').val(obj_temp.freeSpinOnStart);
				$('.txt_add_edit_item_total_quantity').val(0);
				$('.txt_add_edit_item_max_per_user').val(obj_temp.maxSpinPerUser);
				$('#single_select_buy_turn_type').val(obj_temp.buyTurnType);
				// var packagePriceTurn = obj_temp.packagePriceTurn.split(",");
				$(".package_price_turn").remove();
				// $.each(packagePriceTurn , function(index, value) {
				// 	$(".button_package_price_turn").before(htmlPackegePriceTurnCustom(value.split(":")[0], value.split(":")[1]));
				// 	$(".remove_package_price_turn").click(function(){
				// 		$(this).parent().parent().remove();
				// 	})
				// });
				
				$('.txt_add_edit_item_price_per_turn').val(obj_temp.pricePerTurn);

				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_date_start').val(moment.unix(obj_temp.startDate / 1000).format(format.value));
				$('.txt_add_edit_item_date_end').val(moment.unix(obj_temp.endDate / 1000).format(format.value));
				
				// $('.txt_add_edit_item_date_start_rank').val(moment.unix(obj_temp.dateStartRanking / 1000).format(format.value));
				// $('.txt_add_edit_item_date_end_rank').val(moment.unix(obj_temp.dateEndRanking / 1000).format(format.value));
				$('#single_select_rank_type').val(obj_temp.rankingType);
				item_count = obj_temp.spinItems.length;
				$(".more_item").remove();
				$(".quantity_left").parent().remove();
				$(".item_detail").remove();
				$(".add_item_button").remove();
				$(obj_temp.spinItems).each(function (key, item) {
					var html_add_button = ""; 
					html_add_button += '<div class="col-sx-1 add_item_button">';
						html_add_button += '<a style="width:20%;margin-left:378px;font-size:17px;" class="btn btn-icon-only green btn_add_more_item">';
						html_add_button += '<i class="fa fa-plus"></i>';
						html_add_button += '</a>';
						html_add_button += '</div>';
					if (key == (obj_temp.spinItems.length - 1)){
						$('.item_group').append(html_str(key) + html_add_button);
					} else {
						$('.item_group').append(html_str(key));
					}

					$('.btn_add_more_item').click(function () {
						$(this).parent().before(html_str(key));
						actionOfEditItem();
					});

					actionOfEditItem();

					$('#select_item_spin_' + key).val(item.item.id);
					$(".spin_item_id_" + key).val(item.id);
					$(".txt_add_edit_item_total_quantity_" + key).val(item.totalQuantity);
                    $(".position_" + key).val(item.ratioIndex);
					$(".ratio_" + key).val(item.ratio);
					$(".stock_" + key).html(item.receivedQuantity);
				});
				

				$(".position").change(function() {
					var totalPosition = 0;
					$.each($(".position"), function (key, item) {
						totalPosition += Number($(this).val());
					})

					$.each($(".position"), function (key, item) {
						$(this).parent().next().children().val(Math.round(($(this).val()/totalPosition *100) * 100) / 100);
					})

				})

				load_autocomplete_component();
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				jQuery(".select_status option").filter(function () {
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

				// turnoverLandmarkOfGame(obj_temp.type, obj_temp.id);
				// console.log("turnoverLandmarkList", turnoverLandmarkList);

				// TURNOVER MANAGER
				// $('.turnover-landmark').remove();
				// $.each(turnoverLandmarkList, function (key, value) {
				// 	addTurnoverLandmarkItem(value.id,value.itemId, value.turnoverLandmark, value.limitQuantity, value.limitType, 112);
				// })
				// $('.btn-add-turnover-landmark').click(function () {
				// 	addTurnoverLandmarkItem(0,0,0,0,0,0);
				// 	deleteItemTurnoverLandmark();
				// })

				// deleteItemTurnoverLandmark();

				//--------------------------GIỜ VÀNG------------------------
				$('.txt_add_edit_item_gold_time_start').val(moment.unix(obj_temp.goldTimeStart / 1000).format(format.value));
				$('.txt_add_edit_item_gold_time_end').val(moment.unix(obj_temp.goldTimeEnd / 1000).format(format.value));
				$('.txt_add_edit_item_gold_time_item_index').val(obj_temp.goldTimeItemIndex);
				
				$(".gold_time_status option").filter(function() {
                    return $.trim($(this).val()) == obj_temp.goldTimeStatus.toString();
                }).prop('selected', true);
				$('.gold_time_status').selectpicker('refresh');
				
				if (obj_temp.goldTimeStatus == true) {
					$('.gold_time_status button').css('background-color', '#32c5d2');
				} else {
					$('.gold_time_status button').css('background-color', 'red');
				}


			});
			$('.btn_delete_item').click(function () {
				deleted_id = parseInt($(this).attr("item_id"));
				$("#modal_confirm").modal("show");
			});


		},
	});

	function addTurnoverLandmarkItem(id,itemId, landmark, quantity, type, gifted){
		var selected = null;
		var html = '<div class="form-group turnover-landmark">';
					html += 		'<div class="col-xs-4">';
					html += '	<select class="select_item_spin form-control select2 select_default"><option value=0>Hãy Chọn Item</option>';
					$.each(spin_item_list, function (k, i) {
						selected = (i.id == itemId) ? "selected" : null;
						html +="<option value='" + i.id + "'" + selected + ">" + i.name + "</option>";
					});
					
					html += '</select>';
					html += '	<input type="hidden" class="form-control landmark-id"  value="'+ id + '"/>';
					html += '</div>';
					html += '<div class="col-xs-7">';
					html += '	<div class="col-xs-4"><input type="number" class="form-control landmark" value="'+ landmark + '"/></div>';
					html += '	<div class="col-xs-4"><input type="number" class="form-control landmark-quantity" value="'+ quantity + '"/></div>';
					html += '	<div class="col-xs-4">';
					html += '		<select id="landmark-type" class="form-control select2 select_default landmark-type">';
					// html += '			<option value="0">Loại hạn mức</option>';
					selected = (type == "EVENT") ? "selected" : null;
					html += '			<option value="EVENT"' + selected + '>Event</option>';
					selected = (type == "DAY") ? "selected" : null;
					html += '			<option value="DAY"' + selected + '>Day</option>';
					html += '		</select></div>';
					// gifted = (gifted == undefined) ? "" : gifted;
					// html += '	<div class="col-xs-3"><div class="gift-reced">'+ gifted +'</div></div>';
					html += '</div>';
					html += '<div class="col-xs-1">';
					html += '	<a class="btn btn-icon-only red delete-turnover-landmark">';
					html += '		<i class="fa fa-remove"></i>';
					html += '	</a>';
					html += '</div>';
					html += '</div>';
					$(".turnover-landmark-list").append(html);
	}

	function deleteItemTurnoverLandmark(){
		$('.delete-turnover-landmark').click(function () {
			var deleteId = $(this).parent().parent().find(".landmark-id").val();
			if (deleteId != 0 && deleteId != null && deleteId != undefined)
			turnoverLandmarkIdDeletes.push(deleteId);
			turnoverLandmarkIdDeletes = Array.from(new Set(turnoverLandmarkIdDeletes));
			$(this).parent().parent().remove();
		});
	}

	function htmlPackegePriceTurnCustom(price, turn){
		var html = "<div class='col-md-12 package_price_turn' style='margin-bottom:10px'>";
			html += 	"<div class='col-xs-5'>";
			html += 		"<input type='number' class='txt_add_edit_item_price form-control' value='" + price	+ "' min='0'>";
			html += 	"</div>";
			html += 	"<div class='col-xs-1'><span style='font-size: 25px'>/</span></div>";
			html += 	"<div class='col-xs-5'>";
			html += 		"<input type='number' class='txt_add_edit_item_turn form-control' value='" + turn + "'min='1'>";
			html += 	"</div>";
			html += 	"<div class='col-xs-1'>";
			html += 		"<button type='button' class='remove_package_price_turn btn red'>Xóa</button>";
			html += 	"</div>";
			html += "</div>";
		return html;
	}

	$("#add_package_price_turn").click(function(){
		var stringPackegaPriceTurn = [];
		$.each($(".package_price_turn"), function () {
			if ($(this).find(".txt_add_edit_item_price").val() != 0
					&& $(this).find(".txt_add_edit_item_turn").val() != 0){ 
					stringPackegaPriceTurn.push(($(this).find(".txt_add_edit_item_price").val() + ":" + $(this).find(".txt_add_edit_item_turn").val()));
			}
		})
		console.log(stringPackegaPriceTurn.toString());
		$(".button_package_price_turn").before(htmlPackegePriceTurnCustom(0, 0));
		$(".remove_package_price_turn").click(function(){
			$(this).parent().parent().remove();
		});
	})

	function actionOfEditItem(key) {
		$('.btn_delete_item').click(function () {
			$(this).parent().parent().remove();
		});

		// $.each(spin_item_list, function (k, i) {
		// 	$(".select_item_spin").append("<option value='" + i.id + "'>" + i.name + "</option>");
		// });

		$(".select_item_spin").change(function() {
			var select = $(this);
			$.each(spin_item_list, function (k, i) {
				if (i.id == select.val()){
					select.parent().next().children().next().next().next().next().children().html(i.quantity)
				}
				
			});
		})
		
		// $(".txt_add_edit_item_total_quantity").change(function(event) {
			
		// 	var oldValue = Number($(this).next().val());
		// 	var stock = Number($(this).parent().next().children().html());
		// 	if ($(this).val() > stock
		// 		&& $(this).val() > (oldValue + stock)){
		// 		$(this).css("color" , "red");
		// 	} else {
		// 		$(this).css("color" , "black");
		// 	}
		// })
		
	}

	function turnoverLandmarkOfGame(gameType, gameId) {
		$.ajax({
			url: base_request_url + "/admin/turnover-landmark/get?game=" + gameType + "&gameId=" + gameId,
			type: "GET",
			data: _send_info.data,
			async: false,
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$(".loading_icon").hide();
				turnoverLandmarkList = [];
				$(data.data).each(function (key, value) {
					turnoverLandmarkList.push(value);
				});
				load_autocomplete_component();
			},
			error: function (err) {
				console.log(err.error());
			}
		});
	};

	load_autocomplete_component = function () {
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
				data: function (params) {
					return {
						q: params.term, // search term
						page: params.page
					};
				},
				processResults: function (data, page) {
					// parse the results into the format expected by Select2.
					// since we are using custom formatting functions we do not need to
					// alter the remote JSON data
					return {
						results: data.items
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) {
				return markup;
			}, // let our custom formatter work
			minimumInputLength: 1,
			templateResult: formatRepo,
			templateSelection: formatRepoSelection
		});

		$("button[data-select2-open]").click(function () {
			$("#" + $(this).data("select2-open")).select2("open");
		});

		$(":checkbox").on("click", function () {
			$(this).parent().nextAll("select").prop("disabled", !this.checked);
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
			if ($(this).attr("id") == "single_select_user") {
				//event for search field
				typing_input = $('.select2-search__field')[0];
				$(typing_input).on("keypress", function () {
					console.log("press");
					clearTimeout(typingTimer);
					typingTimer = setTimeout(function () {
						//ajax get all tags
						_send_info.data = {
							"limit": 10,
							"offset": 0,
							"roleName": "publisher",
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
							beforeSend: function (xhr) {
								xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
							},
							success: function (data) {
								console.log("success");
								var tags_arr = [];
								$(data.dataArr).each(function (key, item) {
									var publisher = "";
									if (item.username == null) {
										publisher = item.fullName;
									} else {
										publisher = item.username;
									}
									$("#single_select_user").append("<option value='" + item.id + "'> " + publisher + "</option>");
								});
								load_autocomplete_component();
								$("#single_select_user").select2("open");
								$($('.select2-search__field')[0]).val(searching_value_timeout);
							},
							error: function (err) {
								console.log("error");
								console.log(err.error());
							}
						});
					}, doneTypingInterval);
				});
			}
		});

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
		$("#single_select").change(function () {
			var selected_val = parseInt($("#single_select").val());
			if ($.inArray(selected_val, channel_arr) == -1) {
				channel_arr.push(selected_val);
				$(".current_channels").append("<span channel_id='" + selected_val + "' class='tag label label-warning'><i class='fa fa-wrench'></i> " + $("#single_select option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".txt_add_edit_item_channel").val(selected_val);
				$(".current_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_channel").val("");
					remove_channel(parseInt($(this).parent().attr("channel_id")));
					$(this).parent().remove();
				});
			}
		});
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	var remove_channel = function (id) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
	};

};

function html_str(key) {
	var html_str = "";
	html_str += '<div class="form-group item_detail">';
		html_str += '<div class="col-xs-4">';
			html_str += '<select id="select_item_spin_'+ key +'"  class="select_item_spin col-xs-4 form-control select2 select_default"><option value=0>Hãy Chọn Item</option>';
			$.each(spin_item_list, function (k, i) {
				html_str +="<option value='" + i.id + "'>" + i.name + "</option>";
			});
			html_str += '</select>';
		html_str += '</div>';
		html_str += '<div class="col-xs-7">';
			html_str += '<input type="hidden" class="spin_item_id spin_item_id_' + key + '" />';
			html_str += '<div class="col-xs-3"><input type="number" class="form-control position position_'+ key + '" value="0"/></div>';
			html_str += '<div class="col-xs-3"><input type="number" disabled class="form-control ratio_'+ key + '" value="0"/></div>';
			html_str += '<div class="col-xs-3"><input type="number" class="txt_add_edit_item_total_quantity txt_add_edit_item_total_quantity_'+ key + ' form-control" ></div>';
			html_str += '<div class="col-xs-3"><div class="stock stock_'+ key + '"></div></div>';
		html_str += '</div>';
	html_str += '<div class="col-sx-1 del_item_button"><a class="btn btn-icon-only red btn_delete_item"><i class="fa fa-remove"></i></a></div>';
	html_str += '</div>';
	return html_str;
}

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$(".form_datetime").datetimepicker({
		autoclose: true,
		todayBtn: true,
		isRTL: App.isRTL(),
		format: "yyyy-MM-dd hh:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});
	//event for modal
	$(".btn_add_new_item").click(function () {
		$("#add_giftcode_form").trigger('reset');
		$('#modal_add_edit input:file').val("");
		$('#review_image_text').hide();
		$('#link_image_text').html("");
		des = new FroalaEditor('textarea#froala-editor');
		$(".item_detail").remove();
		$(".add_item_button").remove();
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('.hidden_add_edit_item_condidion').attr("name", "conditionId");
		$(".txt_add_edit_item_channel").attr("name", "channelId");
		$('.cb_add_edit_item_condition span').removeClass("checked");
		$('.file_add_edit_item_giftcode').parent().parent().show();
		$('.file_add_edit_item_giftcode').attr("name", "giftCodeFile");
		$('.more_item').remove();
		$('.quantity_left').parent().remove();
		$('.turnover-landmark').remove();
		item_count = 1;
		channel_arr = [];
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('.hidden_giftcode_id').remove();
		$("#modal_add_edit").modal("show");

		var html_add_button = ""; 
			html_add_button += '<div class="col-sx-1 add_item_button">';
				html_add_button += '<a style="width:20%;margin-left:378px;font-size:17px;" class="btn btn-icon-only green btn_add_more_item">';
					html_add_button += '<i class="fa fa-plus"></i>';
				html_add_button += '</a>';
			html_add_button += '</div>';
			$('.item_group').append(html_add_button);
		
		$('.btn_delete_item').click(function () {
			$(this).parent().parent().remove();
		});

		$('.btn_add_more_item').click(function () {
			$(this).parent().before(html_str(0));
			
			$('.btn_delete_item').click(function () {
				$(this).parent().parent().remove();
			});

			$.each(spin_item_list, function (k, i) {
				$(".select_item_spin").append("<option value='" + i.id + "'>" + i.name + "</option>");
			});
			
		});
	});

	$('.btn_confirm_yes').click(function () {
		_send_info.data = {};
		$.ajax({
			url: base_request_url + "/admin/luckySpin?spinEventId=" + deleted_id,
			type: "DELETE",
			data: JSON.stringify(_send_info.data),
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
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_id + "'");
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'");
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin name is required");
			return;
		}
		if ($(".txt_add_edit_item_image").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin image is required");
			return;
		}
		if ($(".txt_add_edit_item_price").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin price is required");
			return;
		}
		if ($(".txt_add_edit_item_date_start").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin start date is required");
			return;
		}
		if ($(".txt_add_edit_item_date_end").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin end date is required");
			return;
		}
		if (des.html.get() == "") {
			show_toast_notif("error", "Unable to create spin", "Spin description is required");
			return;
		}
		if ($(".txt_add_edit_item_free_per_day").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Free spin per day is required");
			return;
		}
		if ($(".txt_add_edit_item_free_on_start").val() == "") {
			show_toast_notif("error", "Unable to create spin", "Free spin on start is required");
			return;
		}
		var start_date = new Date($('.txt_add_edit_item_date_start').val()).getTime();
		var end_date = new Date($('.txt_add_edit_item_date_end').val()).getTime();
		var current_date = new Date().getTime();
		if (start_date > end_date) {
			show_toast_notif("error", "Unable to create spin", "Date range is invalid");
			return;
		}
		var stringPackegaPriceTurn = [];
		$.each($(".package_price_turn"), function () {
			if ($(this).find(".txt_add_edit_item_price").val() != 0
					&& $(this).find(".txt_add_edit_item_turn").val() != 0){ 
					stringPackegaPriceTurn.push(($(this).find(".txt_add_edit_item_price").val() + ":" + $(this).find(".txt_add_edit_item_turn").val()));
			}
		})
		item_list = [];
		var position_count = 0;
		$('.item_group .item_detail').each(function (key, item) {
			item_list.push({
				"itemOfSpinId": $(item).find(".select_item_spin").val(),
				"spinItemId": $(item).find(".spin_item_id").val(),
				"quantity": $(item).find(".txt_add_edit_item_total_quantity").val(),
				"position": $(item).find(".position").val(),
			});
			position_count++;
		});

		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"type": $("#single_select_type_spin").val(),
			"image": $("#link_image_text").html(),
			"description": des.html.get(),
			"linkLiveStream" : $('.txt_add_edit_item_link_live_stream').val(),
			"freeSpinPerDay": $(".txt_add_edit_item_free_per_day").val(),
			"freeSpinOnStart": $(".txt_add_edit_item_free_on_start").val(),
			"maxSpinPerUser": $(".txt_add_edit_item_max_per_user").val(),
			"startDate": new moment($(".txt_add_edit_item_date_start").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"endDate": new moment($(".txt_add_edit_item_date_end").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"buyTurnType" : $("#single_select_buy_turn_type").val(),
			"pricePerTurn" : $(".txt_add_edit_item_price_per_turn").val(),
			"status": $(".select_status option:selected").val(),
			"goldTimeStart": new moment($('.txt_add_edit_item_gold_time_start').val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"goldTimeEnd": new moment($('.txt_add_edit_item_gold_time_end').val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"goldTimeItemIndex":$('.txt_add_edit_item_gold_time_item_index').val(),
			"goldTimeStatus":$(".gold_time_status option").val(),
			"itemOfSpin": item_list
		};

		$.ajax({
			url: base_request_url + "/admin/luckySpin",
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
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'");
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Error", "Unable to create " + item_name);
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText);
			},
		});
		
	});
	$('.btn_modal_save_update').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin name is required");
			return;
		}
		if ($(".txt_add_edit_item_image").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin image is required");
			return;
		}
		if ($(".txt_add_edit_item_price").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin price is required");
			return;
		}
		if ($(".txt_add_edit_item_date_start").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin start date is required");
			return;
		}
		if ($(".txt_add_edit_item_date_end").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin end date is required");
			return;
		}
		if (des.html.get() == "") {
			show_toast_notif("error", "Unable to update spin", "Spin description is required");
			return;
		}
		if ($(".txt_add_edit_item_free_per_day").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Free spin per day is required");
			return;
		}
		if ($(".txt_add_edit_item_free_on_start").val() == "") {
			show_toast_notif("error", "Unable to update spin", "Free spin on start is required");
			return;
		}
		var start_date = new Date($('.txt_add_edit_item_date_start').val()).getTime();
		var end_date = new Date($('.txt_add_edit_item_date_end').val()).getTime();
		var current_date = new Date().getTime();
		if (start_date > end_date) {
			show_toast_notif("error", "Unable to update spin", "Date range is invalid");
			return;
		}
		var stringPackegaPriceTurn = [];
		$.each($(".package_price_turn"), function () {
			if ($(this).find(".txt_add_edit_item_price").val() != 0
					&& $(this).find(".txt_add_edit_item_turn").val() != 0){ 
					stringPackegaPriceTurn.push(($(this).find(".txt_add_edit_item_price").val() + ":" + $(this).find(".txt_add_edit_item_turn").val()));
			}
		})
		item_list = [];
		var position_count = 0;
		$('.item_group .item_detail').each(function (key, item) {
			item_list.push({
				"itemOfSpinId": $(item).find(".select_item_spin").val(),
				"spinItemId": $(item).find(".spin_item_id").val(),
				"quantity": $(item).find(".txt_add_edit_item_total_quantity").val(),
				"position": $(item).find(".position").val(),
			});
			position_count++;
		});

		var turnoverLandmarkListUpdateAndCreate = [];
		$('.turnover-landmark').each(function (key, item) {
			
			turnoverLandmarkListUpdateAndCreate.push({
				"id" : $(item).find(".landmark-id").val(),
				"game": $("#single_select_type_spin").val(),
				"game_id": editing_item,
				"item_id": $(item).find(".select_item_spin").val(),
				"limit_quantity": $(item).find(".landmark-quantity").val(),
				"limit_type": $(item).find(".landmark-type").val(),
				"turnover_landmark": $(item).find(".landmark").val()
			});
		});

		updateAndCreateTurnoverLandmark(turnoverLandmarkListUpdateAndCreate);
		deleteTurnoverLandmark();
		_send_info.data = {
			"spinEventId": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"type": $("#single_select_type_spin").val(),
			"image": $("#link_image_text").html(),
			"description": des.html.get(),
			"linkLiveStream" : $('.txt_add_edit_item_link_live_stream').val(),
			"freeSpinPerDay": $(".txt_add_edit_item_free_per_day").val(),
			"freeSpinOnStart": $(".txt_add_edit_item_free_on_start").val(),
			"maxSpinPerUser": $(".txt_add_edit_item_max_per_user").val(),
			"status": $(".select_status option:selected").val(),
			"startDate": new moment($(".txt_add_edit_item_date_start").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"endDate": new moment($(".txt_add_edit_item_date_end").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"buyTurnType" : $("#single_select_buy_turn_type").val(),
			"pricePerTurn" : $(".txt_add_edit_item_price_per_turn").val(),
			"goldTimeStart": new moment($('.txt_add_edit_item_gold_time_start').val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"goldTimeEnd": new moment($('.txt_add_edit_item_gold_time_end').val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"goldTimeItemIndex":$('.txt_add_edit_item_gold_time_item_index').val(),
			"goldTimeStatus":$(".gold_time_status option:selected").val(),
			"itemOfSpin": item_list
		};
		$.ajax({
			url: base_request_url + "/admin/luckySpin",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {

				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'");
					$('#modal_add_edit').modal('hide');
					page_datatable.ajax.reload(null, false);
				} else {
					show_toast_notif("error", "Error", data.onlyMessage);
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText);
			},
		});
	});
	$('.select_status').change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});

	$('.gold_time_status').change(function () {
		if ($(this).val() == 'true') {
			$('.gold_time_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'false') {
			$('.gold_time_status button').css('background-color', 'red');
		}
	});
	$('.search_submit').click(function () {
		search_value = $('.search_input').val();
		publisher_id = $('#single_select_user').val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		$('.search_input').val("");
		$('#single_select_user').val("");
		load_autocomplete_component();
		publisher_id = "";
		search_value = "";
		page_datatable.ajax.reload(null, false);
	});
	_send_info.data = {
		"limit": 10000,
		"offset": 0
	};
	$.ajax({
		url: base_request_url + "/admin/adminItemOfSpin",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(".loading_icon").hide();
			$(data.dataArr).each(function (key, item) {
				spin_item_list.push(item);
				// $("#single_select_0").append("<option value='" + item.id + "'>" + item.name + "</option>");
				// $("#single_select_1").append("<option value='" + item.id + "'>" + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});
	$.ajax({
		url: base_request_url + "/admin/user",
		type: "GET",
		data: {
			limit: 10,
			offset: 0,
			"roleName": "publisher",
		},
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				var publisher = "";
				if (item.username == null) {
					publisher = item.fullName;
				} else {
					publisher = item.username;
				}
				$("#single_select_user").append("<option value='" + item.id + "'> " + publisher + "</option>");
			});
			load_autocomplete_component();
			$(".loading_icon").hide();
		},
		error: function (err) {
			$(".loading_icon").hide();
			console.log(err.error());
		}
	});

	function updateAndCreateTurnoverLandmark(turnoverLandmarkListUpdateAndCreate){
		var turnoverLandmarkListUpdate = [];
		var turnoverLandmarkListCreate = [];
		$.each(turnoverLandmarkListUpdateAndCreate, function(key, value){
			if (value.id != 0) {
				turnoverLandmarkListUpdate.push(value);
			} else {
				turnoverLandmarkListCreate.push(value);
			}
		})
		$.ajax({
			url: base_request_url + "/admin/turnover-landmark/update",
			type: "POST",
			data: JSON.stringify(turnoverLandmarkListUpdate),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.status == '01') {
					// show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'");
					// $('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Error", data.status.message);
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText);
			},
		});

		$.ajax({
			url: base_request_url + "/admin/turnover-landmark/create",
			type: "POST",
			data: JSON.stringify(turnoverLandmarkListCreate),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.status == '01') {
					// show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'");
					// $('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Error", "Unable to create TurnoverLandmark ");
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText);
			},
		});
	}

	function deleteTurnoverLandmark(){
		if (turnoverLandmarkIdDeletes != null){
			$.ajax({
				url: base_request_url + "/admin/turnover-landmark/delete?ids=" + turnoverLandmarkIdDeletes,
				type: "DELETE",
				contentType: "application/json",
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
				},
				success: function (data) {
					if (data.status == '01') {
						// show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'");
						// $('#modal_add_edit').modal('hide');
					} else {
						show_toast_notif("error", "Error", "Unable to delete TurnoverLandmark ");
					}
				},
				error: function (error) {
					show_toast_notif("error", "Error", "Error info: " + error.responseText);
				},
			});
		}
	}

	//=================UPLOAD image spin item

	$("#txt_add_edit_image_text").change(function(){
		linkImage = null;
		flagNewImage = false;
		imageCarosel = null;
		// $(".form_link_image_text").hide();
		var image = this.files[0];
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
				$('#review_image_text').show();
				$('#review_image_text').attr("src",URL.createObjectURL(this.files[0]));
				imageCarosel = this.files[0];
				flagNewImage = true;
		} else {
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
		}
	});

	$("#upload_image_text").click(function(){
		$(".loading_icon").show();
		uploadImage();
		$(".loading_icon").hide();
		if (linkImage == null){
			show_toast_notif("error", "Error", "Upload ảnh xảy ra lỗi", function () { });
			return;
		}
		$("#link_image_text").html(linkImage);
	});

	function uploadImage(){
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
						if ($("#link_image_text").html() !== "") {
							deleteImage();
						}
					} else {
						show_toast_notif("error", "Fail", "Upload Image Unsuccess");
					}
				},
				error: function (error) {
					show_toast_notif("error", "Fail", "Error '" + error.message + "'");
				},
			});
		} 
	}
	
	function deleteImage(){
		if(flagNewImage) {
	
			_send_info.data = {
				"urlImage" : $("#link_image_text").html()
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
						show_toast_notif("error", "Fail", "Upload Image Unsuccess");
					}
				},
				error: function (error) {
					show_toast_notif("error", "Fail", "Error '" + error.message + "'");
				},
			});
		} 
	}

});