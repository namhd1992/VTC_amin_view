var luckySpins = [];
var luckySpin = null;
var valueMinDate = 0;
var valueMaxDate = 0;
var Result = function() {

    initChart = function() {
        $(".loading_icon").show();
        _user_data = $.parseJSON(localStorage.getItem("user_data"));
        var sendInfo = {
            limit: 10000,
            offset: 0
        };
        
        _send_info.data = {
            "limit": 1,
            "offset": 0
        };

        $.ajax({
            url: base_request_url + "/admin/luckySpin",
            type: "GET",
            data: _send_info.data,
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                $(".loading_icon").hide();
                luckySpins = data.data;
                var html = "";
                $.each(luckySpins, function(key, value){
                    html += "<option value='"+ value.id +"'>"+ value.name +"</option>";
                });
               $(".select_filter_lucky_spin").append(html);
            },
            error: function(err) {
                $(".loading_icon").hide();
                console.log("error");
                console.log(err.error());
            }
        });

        $(".select_filter_lucky_spin").change(function(){
            $.each(luckySpins, function(key, value){
                
            });
        })
        

        var ctxL = $("#turnover_Chart")[0].getContext("2d");
        turnover_Chart = new Chart(ctxL, {
            type: 'line',
            data: {},
            options: {
            responsive: true
            }
        });

        $.each($(".chart_basic"), function(keyData, value){
            var total_spin_turn_Chart_ctxL = value.getContext("2d");
            total_spin_turn_Chart = new Chart(total_spin_turn_Chart_ctxL, {
                type: 'line',
                data: {},
                options: {
                responsive: true
                }
            });

        });
        
        function createTurnoverGraph(LABELS, TURNOVER_SK, TURNOVER_GROW_UP) {
            turnover_Chart = new Chart(ctxL, {
                type: 'line',
                data: {
                    labels: LABELS,
                    datasets: [
                        {
                            label: "DOANH THU",
                            data: TURNOVER_SK,
                            backgroundColor: [
                            'rgba(105, 0, 132, 0)',
                            ],
                            borderColor: [
                            'rgba(200, 99, 132, .7)',
                            ],
                            borderWidth: 2
                        },
                        {
                            label: "DOANH THU TĂNG THÊM",
                            data: TURNOVER_GROW_UP,
                            backgroundColor: [
                            'rgba(105, 0, 132, 0)',
                            ],
                            borderColor: [
                            'rgba(2, 99, 100, .2)',
                            ],
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                responsive: true
                }
            });
        }

        function createIndexGraph(graph, data) {
            if (graph != null && graph != undefined) {
                var index_Chart_ctxL = graph.getContext("2d");
                total_index_Chart = new Chart(index_Chart_ctxL, {
                    type: 'line',
                    data: {
                        labels: ["1","2","3","4","5","6","7"],
                        datasets: [
                            {
                                label: "",
                                data: data,
                                backgroundColor: [
                                'rgba(105, 0, 132, 0)',
                                ],
                                borderColor: [
                                'rgba(200, 99, 132, 1)',
                                ],
                                borderWidth: 3
                            }
                        ]
                    },
                    options: {
                    responsive: true
                    }
                });
            }
           
        }

        $( ".datepicker" ).datetimepicker({
            autoclose: true,
            todayBtn: true,
            isRTL: App.isRTL(),
            format: "yyyy-MM-dd hh:ii",
            pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
        });

        function setData(){
            data = [];
            data.lu
        }

        $(".search_submit").click(function(){
            var luckySpinId = $(".select_filter_lucky_spin").val();
            $(".report_item").remove();
            if (luckySpinId == null || luckySpinId == 0) {
                show_toast_notif("error", "Unable to search Item", "You must be select lucky spin item");
                return;
            }

            $.each(luckySpins, function(key, value){
            if ($(".select_filter_lucky_spin").val() == value.id) {
                luckySpin = value;
                }
            });
            
            var format = getSetting(_setting_data, "date_format");
            if ($( ".txt_filter_date_start" ).val() == "") {
                $( ".txt_filter_date_start" ).val(moment.unix(luckySpin.startDate / 1000).format("YYYY-MMMM-D HH:mm"));
            }

            if ($( ".txt_filter_date_end" ).val() == "") {
                $( ".txt_filter_date_end").val(moment.unix(new Date() / 1000).format("YYYY-MMMM-D HH:mm"));
            }

            var startDate = new moment($(".txt_filter_date_start").val(), "YYYY-MMMM-D hh:mm").unix() * 1000;;
            var endDate = new moment($(".txt_filter_date_end").val(), "YYYY-MMMM-D hh:mm").unix() * 1000;;

            $(".loading_icon").show();
            $.ajax({
                url: base_request_url + "/admin/spin-result-report?lucky_spin_id=" + luckySpinId + "&startDate=" + startDate + "&endDate=" + endDate ,
                type: "GET",
                data: _send_info.data,
                contentType: "application/json",
                dataType: "json",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                },
                success: function(data) {
                    var labels = [];
                    var TURNOVER_SK = [];
                    var TURNOVER_GROW_UP = [];

                    var generalIndex = [
                        TURNOVER_BY_CARD = [],
                        TURNOVER_BY_SCOIN = [],
                        AWARDING_EXPENSES = [],
                        BALANCE_EXPENSES = [],

                        TOTAL_SPIN = [],
                        TOTAL_SPIN_DONOT_ACCESS_SK = [],
                        TOTAL_SPIN_ACCESS_SK = [],
                        TOTAL_SPIN_USED = [],

                        TOTAL_USER_JOIN_EVENT = [],
                        //  LUCKY_NUMBER = [],
                        SCOIN_5k = [],
                        SCOIN_10k = [],
                        SCOIN_20k = [],
                        SCOIN_50k = [],
                        SCOIN_100k = [],
                        SCOIN_500k = [],
                        SCOIN_1tr = [],
                        SCOIN_5tr = []
                        //  WORD_CHAO = [],
                        //  WORD_DON = [],
                        //  WORD_CANH = [],
                        //  WORD_TY = [],
                        //  WORD_TET = [],
                    ]

                    var awardingExpensesLastDay = 0;
                    $.each(data.data, function(keyData, valueData){
                        if (valueData.date != "ALL"){
                            labels.push(valueData.date)
                            console.log("valueData.data", valueData.data);
                            $.each(valueData.data, function(key, value){

                                switch (value.typeItem) {
                                    case "TURNOVER_SK":
                                        var turnover_sk = Math.round(value.value * 100) / 100
                                        var countDayEvent = Math.ceil(Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000) / 86400);
                                        // console.log("startdate : " + new Date(startDate) + ", enđate : " + new Date(endDate))
                                        TURNOVER_SK.push(turnover_sk);
                                        TURNOVER_GROW_UP.push(turnover_sk - 1030000000);
                                    break;
                                    case "TURNOVER_BY_CARD":
                                        TURNOVER_BY_CARD.push(value.value);
                                    break;
                                    case "TURNOVER_BY_SCOIN":
                                        TURNOVER_BY_SCOIN.push(value.value);
                                    break;
                                    case "AWARDING_EXPENSES":
                                        AWARDING_EXPENSES.push(value.value);
                                        
                                        awardingExpensesLastDay = value.value;
                                        BALANCE_EXPENSES.push(13171783 - value.value);
                                    break;
                                    // case "AWARDING_EXPENSES":
                                    //     AWARDING_EXPENSES.push(value.value);
                                    // break;


                                    case "TOTAL_SPIN":
                                        TOTAL_SPIN.push(value.total);
                                    break;
                                    case "TOTAL_SPIN_DONOT_ACCESS_SK":
                                        TOTAL_SPIN_DONOT_ACCESS_SK.push(value.total);
                                    break;
                                    case "TOTAL_SPIN_ACCESS_SK":
                                        TOTAL_SPIN_ACCESS_SK.push(value.total);
                                    break;
                                    case "TOTAL_SPIN_USED":
                                        TOTAL_SPIN_USED.push(value.total);
                                    break;
        

                                    case "LUCKY_NUMBER":
                                        LUCKY_NUMBER.push(value.total);
                                    break;

        
                                    case "TOTAL_USER_JOIN_EVENT":
                                        TOTAL_USER_JOIN_EVENT.push(value.total);
                                    break;
        
                                    

                                    // case "WORD":
                                    //     switch (value.value) {
                                    //         case 1:
                                    //             WORD_CHAO.push(value.total);
                                    //         break;
        
                                    //         case 2:
                                    //             WORD_DON.push(value.total);
                                    //         break;
        
                                    //         case 3:
                                    //             WORD_CANH.push(value.total);
                                    //         break;
        
                                    //         case 4:
                                    //             WORD_TY.push(value.total);
                                    //         break;
        
                                    //         // case 5:
                                    //         //     WORD_TET.push(value.total);
                                    //         // break;
        
                                    //     }
                                    // break;
        
                                    // case "SCOIN_CARD":
                                    //     switch (value.value) {
                                    //         case 10000:
                                    //             SCOIN_CARD_10k.push(value.total);
                                    //         break;
        
                                    //         case 20000:
                                    //             SCOIN_CARD_20k.push(value.total);
                                    //         break;
        
                                    //         case 50000:
                                    //             SCOIN_CARD_50k.push(value.total);
                                    //         break;
        
                                    //         case 100000:
                                    //             SCOIN_CARD_100k.push(value.total);
                                    //         break;
        
                                    //         case 500000:
                                    //             SCOIN_CARD_500k.push(value.total);
                                    //         break;
        
                                    //     }
                                    // break;
        
                                    case "SCOIN":
                                        switch (value.value) {
                                            case 5000:
                                                SCOIN_5k.push(value.total);
                                            break;
        
                                            case 10000:
                                                SCOIN_10k.push(value.total);
                                            break;
        
                                            case 20000:
                                                SCOIN_20k.push(value.total);
                                            break;
        
                                            case 50000:
                                                SCOIN_50k.push(value.total);
                                            break;
        
                                            case 100000:
                                                SCOIN_100k.push(value.total);
                                            break;

                                            case 500000:
                                                SCOIN_500k.push(value.total);
                                            break;

                                            case 1000000:
                                                SCOIN_1tr.push(value.total);
                                            break;

                                            case 5000000:
                                                SCOIN_5tr.push(value.total);
                                            break;
                                        }
                                    break;
                                    
                                }

                            //    console.log("key , value.typeItem , value ", key + " , " + value.typeItem + " , " + value.total);
                               
                            });
                        } else {
                            $.each(valueData.data, function(key, value){
                                switch (value.typeItem) {
                                    case "TURNOVER_SK":
                                        var turnover_sk = Math.round(value.value * 100) / 100
                                        countDayEvent = Math.ceil(Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000) / 86400);
                                        
                                        $( ".turnover_sk" ).text(turnover_sk);
                                        $( ".turnover_grow_up_sk" ).text(turnover_sk - (1030000000 * countDayEvent));
                                    break;
                                    case "TURNOVER_BY_CARD":
                                        $( ".turnover_by_card" ).attr("data-value", value.value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                    break;
                                    case "TURNOVER_BY_SCOIN":
                                        $( ".turnover_by_scoin" ).attr("data-value", value.value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                    break;
                                    case "AWARDING_EXPENSES":
                                        $( ".awarding_expenses" ).attr("data-value", value.value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                        var balance_expenses = (13171783 * (countDayEvent - 1)) - (value.value - awardingExpensesLastDay);
                                        console.log("balance_expenses : ", balance_expenses)
                                        console.log("value.value : ", value.value)
                                        console.log("awardingExpensesLastDay : ", awardingExpensesLastDay)
                                        $( ".balance_expenses" ).attr("data-value", balance_expenses.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                                    break;


                                    case "TOTAL_SPIN":
                                        $( ".total_spin_turn" ).attr("data-value", value.total);
                                    break;
                                    case "TOTAL_SPIN_DONOT_ACCESS_SK":
                                        $( ".total_spin_not_access" ).attr("data-value", value.total);
                                    break;
                                    case "TOTAL_SPIN_ACCESS_SK":
                                        $( ".total_spin_access" ).attr("data-value", value.total);
                                    break;
                                    case "TOTAL_SPIN_USED":
                                        $( ".total_spin_turn_used" ).attr("data-value", value.total);
                                    break;


                                    case "LUCKY_NUMBER":
                                        $( ".total_gift_lucky_spin" ).attr("data-value", value.total);
                                    break;


                                    case "TOTAL_USER_JOIN_EVENT":
                                        $( ".total_user_join_event" ).attr("data-value", value.total);
                                    break;
                                    

                                    // s
        
                                    // case "SCOIN_CARD":
                                    //     switch (value.value) {
                                    //         case 10000:
                                    //             $( ".total_gift_card_10k" ).attr("data-value", value.total);
                                    //             $(".total_gift_card_10k").counterUp();
                                    //         break;
        
                                    //         case 20000:
                                    //             $( ".total_gift_card_20k" ).attr("data-value", value.total);
                                    //             $(".total_gift_card_20k").counterUp();
                                    //         break;
        
                                    //         case 50000:
                                    //             $( ".total_gift_card_50k").attr("data-value", value.total);
                                    //             $(".total_gift_card_50k").counterUp();
                                    //         break;
        
                                    //         case 100000:
                                    //             $( ".total_gift_card_100k").attr("data-value", value.total);
                                    //             $(".total_gift_card_100k").counterUp();
                                    //         break;
        
                                    //         case 500000:
                                    //             $( ".total_gift_card_500k").attr("data-value", value.total);
                                    //             $(".total_gift_card_500k").counterUp();
                                    //         break;
        
                                    //     }
                                    // break;
        
                                    case "SCOIN":
                                        switch (value.value) {
                                            case 5000:
                                                exportItem('SCOIN 5K', "scoin_5k", value.total)
                                                $(".scoin_5k").counterUp();
                                            break;
        
                                            case 10000:
                                                exportItem('SCOIN 10K', "scoin_10k", value.total)
                                                $(".scoin_10k").counterUp();
                                            break;
        
                                            case 20000:
                                                exportItem('SCOIN 20K', "scoin_20k", value.total)
                                                $(".scoin_20k").counterUp();
                                            break;
        
                                            case 50000:
                                                exportItem('SCOIN 50K', "scoin_50k", value.total)
                                                $(".scoin_50k").counterUp();
                                            break;
        
                                            case 100000:
                                                exportItem('SCOIN 100K', "scoin_100k", value.total)
                                                $(".scoin_100k").counterUp();
                                            break;

                                            case 500000:
                                                exportItem('SCOIN 500K', "scoin_500k", value.total)
                                                $(".scoin_500k").counterUp();
                                            break;

                                            case 1000000:
                                                exportItem('SCOIN 1 triệu', "scoin_1m", value.total)
                                                $(".scoin_1m").counterUp();
                                            break;

                                            case 5000000:
                                                exportItem('SCOIN 5 Triệu', "scoin_5m", value.total)
                                                $(".scoin_5m").counterUp();
                                            break;
                                        }
                                    break;
                                }
                            });
                        }
                    });

                    function exportItem(name, className, value) {
                        var html = "";
                        html += '<div class="col-md-3 report_item">';
                        html += '<div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 bordered">';
                        html += '<h4 class="widget-thumb-heading">' + name + '</h4>';
                        html += '<div class="widget-thumb-wrap">';
                        html += '<i class="widget-thumb-icon bg-red icon-credit-card"></i>';
                        html += '<div class="widget-thumb-body">';
                        html += '<span class="widget-thumb-subtitle">Total</span>';
                        html +=	'<span class="widget-thumb-body-stat ' + className + '"  data-counter="counterup" data-value="' + value + '">0</span>';
                        html +=	'<span class="widget-thumb-body-stat " style="color: yellowgreen"><canvas class="chart_basic" style="max-width: 500px; max-height: 100px;"></canvas></span>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';

                        $('.item-word').after($(html));
                        
                    }

                    createTurnoverGraph(labels, TURNOVER_SK, TURNOVER_GROW_UP);

                    // console.log("generalIndex", generalIndex[10]);
                    $.each(generalIndex, function(key, value){
                        if(value.length == 0) value.push(0);
                        // console.log("generalIndex value", value);
                        createIndexGraph($(".chart_basic")[key], value);
                    })

                    $.each($(".money_text"), function(key, value){
                        $(this).counterUp();
                       
                    });
                    $.each($(".money_text_SK"), function(key, value){
                        $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                       
                    });
                    $(".loading_icon").hide();
                },
                error: function(err) {
                    $(".loading_icon").hide();
                    console.log("error");
                    console.log(err.error());
                }
            });

            
        });
       
    }

    return {
        init: function() {
            initChart();
        }
    };
}();

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        Result.init();
    });
}