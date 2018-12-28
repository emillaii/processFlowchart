$(document).ready(function() {
    var data = {};
    var init_aa_params = { mode: 1, start_pos: 2, stop_pos: 3 };
    var init_oc_params = { debug: false };
    var init_basic_params = { retry: 3 , delay_in_ms: 100 };

    var latestCreatedLinkId;
    var $operatorProperties = $('#operator_properties');
    var $linkProperties = $('#link_properties');
    var $operatorTitle = $('#operator_title');
    var $aa_operatorTitle = $('#aa_operator_title');
    var $operator_properties = $('#operator_properties');
    var $aa_operator_properties = $('#aa_operator_properties');
    var $linkColor = $('#link_color');

    //Init the table 
    $aa_operator_properties.append("<div style=\"margin-top:20px\">Select AA mode: <select id=\"aa_mode\"><option value=0>DOV_Search</option><option value=1>ZScan</option></select></div>");
    $aa_operator_properties.append("<div style=\"margin-top:20px\">Start Position: <input type=\"number\" id=\"aa_start_position\"></div>");
    $aa_operator_properties.append("<div style=\"margin-top:20px\">Stop Position: <input type=\"number\" id=\"aa_stop_position\"></div>");

    $operator_properties.append("<div style=\"margin-top:20px\">Retry Count: <input type=\"number\" id=\"basic_retry\"></div>");
    $operator_properties.append("<div style=\"margin-top:20px\">Delay: <input type=\"number\" id=\"basic_delay\"></div>");

    // Apply the plugin on a standard, empty div...
    var $flowchart = $('#example_7');

    $flowchart.flowchart({
      data: data,
      multipleLinksOnInputof: true,
      multipleLinksOnOutput: true,
      linkWidth: 4,
      onOperatorSelect: function(operatorId) {
        var params = $flowchart.flowchart('getOperatorParams', operatorId);
        if (operatorId.includes("AA_")) {
          $operatorProperties.hide();
          $aa_operator_properties.show();
          $aa_operatorTitle.val($flowchart.flowchart('getOperatorTitle', operatorId));
          $('#aa_mode').val(params["mode"]);
          $('#aa_start_position').val(params["start_pos"]);
          $('#aa_stop_position').val(params["stop_pos"]);
        } else {
          $aa_operator_properties.hide();
          $operatorProperties.show();
          $operatorTitle.val($flowchart.flowchart('getOperatorTitle', operatorId));
          $('#basic_delay').val(params["delay_in_ms"]);
          $('#basic_retry').val(params['retry']);
        }
        return true;
      },
      onOperatorUnselect: function() {
        $operatorProperties.hide();
        $aa_operator_properties.hide();
        return true;
      },
      onLinkSelect: function(linkId) {
        return true;
      },
      onLinkUnselect: function() {
        $linkProperties.hide();
        return true;
      },
      onLinkCreate: function(linkId, linkData) {
        console.log(linkId + " link is created. " + linkData);
        if (linkData.fromConnector == "fail") {
           latestCreatedLinkId = linkId;
        }
        return true;
      },
      onAfterChange: function(changeType) {
        if(changeType == "link_create" && typeof latestCreatedLinkId !== 'undefined')
        {
           var color = "#FF3371";
           console.log("latestCreatedLinkId: " + latestCreatedLinkId);
           $flowchart.flowchart('setLinkMainColor', latestCreatedLinkId, color);
           $flowchart.flowchart('redrawLinksLayer');
        }
        return true;
      }
    });

    $operatorTitle.keyup(function() {
      var selectedOperatorId = $flowchart.flowchart('getSelectedOperatorId');
      if (selectedOperatorId != null) {
        $flowchart.flowchart('setOperatorTitle', selectedOperatorId, $operatorTitle.val());
      }
    });
    
    $linkColor.change(function() {
      var selectedLinkId = $flowchart.flowchart('getSelectedLinkId');
      if (selectedLinkId != null) {
        $flowchart.flowchart('setLinkMainColor', selectedLinkId, $linkColor.val());
      }
    });
    
    var operatorI = 0;
    function addOperationWidget(name) {
      var operatorId = name + '_' + operatorI;
      var operatorData = {
        top: 10,
        left: 10,
        properties: {
          title: name,
          inputs: {
            input_1: {
              label: 'In',
              multiple: true
            }
          },
          outputs: {
            success: {
              label: 'success',
            },
            fail: {
              label: 'fail',
            }
          }
        }
      };
      operatorI++;
      console.log("Create operator");
      $flowchart.flowchart('createOperator', operatorId, operatorData);
      var testData = {
        name: "Emil", id: "123"
      };
      if (operatorId.includes("AA_")) {
        $flowchart.flowchart('setOperatorParams', operatorId, init_aa_params);
      } else {
        $flowchart.flowchart('setOperatorParams', operatorId, init_basic_params);
      }
    }

    function addStartWidget() {
      var operatorId = 'start';
      var operatorData = {
        top: 10,
        left: 10,
        properties: {
          title: 'Start',
          outputs: {
            success: {
              label: 'To'
            }
          }
        }
      };
      operatorI++;
      $flowchart.flowchart('createOperator', operatorId, operatorData);
    }

    function addEndWidget(name) {
      var operatorId = name + '_' + operatorI;
      var operatorData = {
        top: 10,
        left: 10,
        properties: {
          title: name,
          inputs: {
            input_1: {
              label: 'In',
              multiple: true
            }
          }
        }
      };
      operatorI++;
      $flowchart.flowchart('createOperator', operatorId, operatorData);
    }

    $flowchart.siblings('.create_start').click(function() {
      addStartWidget();
    });

    $flowchart.siblings('.create_operator').click(function() {
      addOperationWidget("test");
    });

    $flowchart.siblings('.create_init_camera').click(function() { addOperationWidget("Init Camera"); });
    $flowchart.siblings('.create_aa').click(function() { addOperationWidget("AA"); });
    $flowchart.siblings('.create_oc').click(function() { addOperationWidget("OC"); });
    $flowchart.siblings('.create_disp').click(function() { addOperationWidget("Dispense"); });
    $flowchart.siblings('.create_uv').click(function() { addOperationWidget("UV"); });
    $flowchart.siblings('.create_accept').click(function() { addEndWidget("Accept"); });
    $flowchart.siblings('.create_reject').click(function() { addEndWidget("Reject"); });
    
    $flowchart.siblings('.delete_selected_button').click(function() { $flowchart.flowchart('deleteSelected'); });
    
    $flowchart.siblings('.get_data').click(function() {
      var data = $flowchart.flowchart('getData');
      $('#flowchart_data').val(JSON.stringify(data, null, 2));
    });
    
    $flowchart.siblings('.set_data').click(function() {
      var data = JSON.parse($('#flowchart_data').val());
      $flowchart.flowchart('setData', data);
    });

    $flowchart.siblings('.update_data').click(function() {
       var selectedOperatorId = $flowchart.flowchart('getSelectedOperatorId');
       if (selectedOperatorId == null) { return; }
       console.log('update opeator: ' + selectedOperatorId);
       if (selectedOperatorId.includes("AA_")) {
        $flowchart.flowchart('setOperatorTitle', selectedOperatorId, $aa_operatorTitle.val());
        var params = { mode: $('#aa_mode').val(), start_pos: $('#aa_start_position').val(), stop_pos: $('#aa_stop_position').val() };
        $flowchart.flowchart('setOperatorParams', selectedOperatorId, params);
       } else {
         $flowchart.flowchart('setOperatorParams', selectedOperatorId, init_basic_params);
         var params = { retry: $('#basic_retry').val(), delay_in_ms: $('#basic_delay').val() };
         $flowchart.flowchart('setOperatorParams', selectedOperatorId, params);
       }
       alert("Params is updated");
    });

    function saveFile() {
        var shape = $(".shape"),
            name = $("#filename").val() || "data-" + $.now();
        shape.data("style", shape.css(["color", "width", "height"]));
        var request = function (url, filename) {
            var file = {
                json: JSON.stringify(shape.data("style"))
            };
            return $.ajax({
                beforeSend: function (jqxhr, settings) {
                    jqxhr.filename = filename;
                },
                url: url,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: file
            }).then(function (data, textStatus, jqxhr) {
                    $("a#download").attr({
                        "download": jqxhr.filename + ".json",
                            "href": "data:application/json;charset=utf8;base64," 
                                    + window.btoa(JSON.stringify(data))
                    }).get(0).click();
             }, function(jqxhr, textStatus, errorThrown) {
                  console.log(textStatus, errorThrown)
            });
        };
        request("/echo/json/", name)
    };

  });