(function(){
  angular.module('starter')
  .controller('DeviceController', ['$scope', '$state', '$stateParams', 'DeviceFactory', DeviceController]);

  function DeviceController($scope, $state, $stateParams, DeviceFactory,){
    var datare = '';
    var dataReady;
    var stop = 0;

    var me = this;

    var service_id = '12ab';
    var sendLoginInformation_id = 'D001';
    var login_id = 'D002';
    var getData_id = 'D003';
    var moreData_id = 'D004';
    var setDate_id = 'D005';
    var getErrors_id = 'D006';
    var setSetting_id = 'D007';
    var update_id = 'D008';

    me.sendingMessage = {
      request: '',
      username: '',
      password: '',
      setting: '',
      value: '',
      date: ''
    }

    $scope.init = function(){
      $scope.device = DeviceFactory.getDevice($stateParams.id);
      console.log($scope.device);
      console.log($stateParams.id);
    }
    $scope.information = function(){
        console.log(JSON.stringify(me.sendingMessage));
        me.sendingMessage.request = 'LoginInformation';
        var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
        ble.write(
          $stateParams.id,
          service_id,
          sendLoginInformation_id,
          data.buffer,
          function(response){

          },
          function(err){
            alert("Error occured while sending login information. Please try again.");
          }
        );
        ble.read($stateParams.id, service_id, login_id,
              function(data){
                  console.log("The Response: "+ArrayBufferToString(data));
                  if (ArrayBufferToString(data).trim() == new String("OK").trim()) {
                      console.log("Test");
                      // var refreshIntervalId = setInterval(function() {
                      //     console.log('test');
                      //     if(stop == 1){
                      //         console.log('test2');
                      //         clearInterval(refreshIntervalId);
                      //     } else {
                      //         ble.read($stateParams.id, service_id, update_id,
                      //               function(data){
                      //                   console.log("The Response: "+ArrayBufferToString(data));
                      //                   var Data = JSON.parse( ArrayBufferToString(data) );
                      //                   document.getElementById('fps').innerHTML = ""+Data.FPS;
                      //                   document.getElementById('mod').innerHTML = ""+Data.MOD;
                      //                   document.getElementById('sync').innerHTML = ""+Data.SYN;
                      //                   document.getElementById('ber').innerHTML = ""+Data.BER;
                      //               },
                      //               function(failure){
                      //                   alert("Failed to read characteristic from device.");
                      //               }
                      //           );
                      //       }
                      // }, 5000);
                      $state.go('buttons', { 'id': $stateParams.id });
                  }
                  else {
                      alert('... traitor trooper');
                  }
              },
              function(failure){
                  alert("Failed to read characteristic from device.");
              }
          );
    }

    function ArrayBufferToString(buffer) {
        return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
    }

    function StringToArrayBuffer(string) {
        return StringToUint8Array(string).buffer;
    }

    function BinaryToString(binary) {
        var error;

        try {
            return decodeURIComponent(escape(binary));
        } catch (_error) {
            error = _error;
            if (error instanceof URIError) {
                return binary;
            } else {
                throw error;
            }
        }
    }

    function StringToBinary(string) {
        var chars, code, i, isUCS2, len, _i;

        len = string.length;
        chars = [];
        isUCS2 = false;
        for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
            code = String.prototype.charCodeAt.call(string, i);
            if (code > 255) {
                isUCS2 = true;
                chars = null;
                break;
            } else {
                chars.push(code);
            }
        }
        if (isUCS2 === true) {
            return unescape(encodeURIComponent(string));
        } else {
            return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
        }
    }

    function StringToUint8Array(string) {
        var binary, binLen, buffer, chars, i, _i;
        binary = StringToBinary(string);
        binLen = binary.length;
        buffer = new ArrayBuffer(binLen);
        chars  = new Uint8Array(buffer);
        for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
            chars[i] = String.prototype.charCodeAt.call(binary, i);
        }
        return chars;
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    $scope.backToHome = async function(){
      stop = 1;
      await sleep(10000);
      $state.go('home');
      ble.disconnect($stateParams.id);
    }

    async function restFunction(_callback){
        var moreData = 1;
        while(moreData == 1){
            ble.read($stateParams.id, service_id, moreData_id,
                  function(dataMore){
                      console.log(ArrayBufferToString(dataMore));
                      console.log(datare);
                      datare = datare + ArrayBufferToString(dataMore).substring(1);
                      if(ArrayBufferToString(dataMore).substring(0,1).trim() == new String("0").trim()){
                          moreData = 0;
                          _callback();
                      }
                      console.log(typeof datare);
                      console.log('data' + datare);
                  },
                  function(failure){
                      alert("Failed to read characteristic from device.");
                  }
              );
              await sleep(500);
        }

    }

    function getData(dataRequest,_callback){
        var dataIndicator;
        ble.read($stateParams.id, service_id, dataRequest,
              function(data){
                  console.log("The Response: "+ArrayBufferToString(data));
                  dataIndicator = ArrayBufferToString(data).substring(0,1).trim();
                  datare = ArrayBufferToString(data).substring(1);
                  if(dataIndicator == 1){
                      restFunction(function() {
                          _callback();
                      });
                  }
                else{
                    _callback();
                }
              },
              function(failure){
                  alert("Failed to read characteristic from device.");
              }
          );

    }

    $scope.showSelectValueFPS = function(myFPSSelect) {
        console.log(myFPSSelect);
        var element = document.getElementById("fpsSelect");
        element.value = 0;
        document.getElementById("fps").innerHTML = ""+myFPSSelect;

        me.sendingMessage.request = 'setSetting';
        me.sendingMessage.setting = 'fps';
        me.sendingMessage.value = ''+myFPSSelect;
        var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
        ble.write(
          $stateParams.id,
          service_id,
          setSetting_id,
          data.buffer,
          function(response){

          },
          function(err){
            alert("Error occured while sending login information. Please try again.");
          }
        );

    }

    $scope.showSelectValueMOD = function(myMODSelect) {
        console.log(myMODSelect);
        var element = document.getElementById("modSelect");
        element.value = -1;
        document.getElementById("mod").innerHTML = ""+myMODSelect;

        me.sendingMessage.request = 'setSetting';
        me.sendingMessage.setting = 'mod';
        me.sendingMessage.value = ''+myMODSelect;
        var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
        ble.write(
          $stateParams.id,
          service_id,
          setSetting_id,
          data.buffer,
          function(response){

          },
          function(err){
            alert("Error occured while sending login information. Please try again.");
          }
        );
    }

    $scope.showSelectValueVCL = function(myVCLSelect) {
        console.log(myVCLSelect);
        var element = document.getElementById("vclSelect");
        element.value = 0;
        document.getElementById("vcl").innerHTML = ""+myVCLSelect;

        me.sendingMessage.request = 'setSetting';
        me.sendingMessage.setting = 'vcl';
        me.sendingMessage.value = ''+myVCLSelect;
        console.log(JSON.stringify(me.sendingMessage));
        var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
        ble.write(
          $stateParams.id,
          service_id,
          setSetting_id,
          data.buffer,
          function(response){

          },
          function(err){
            alert("Error occured while sending login information. Please try again.");
          }
        );
    }

    $scope.graphError = function(){
        me.sendingMessage.date = document.getElementById("date").value.replace("T", " ")+".1";
        console.log(document.getElementById("date").value);
        me.sendingMessage.request = 'getErrors';
        var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
        ble.write(
          $stateParams.id,
          service_id,
          setDate_id,
          data.buffer,
          function(response){

          },
          function(err){
            alert("Error occured while sending login information. Please try again.");
          }
        );
        dataReady = 0;
        getData(getErrors_id,
            function() {
                console.log('hello'+datare);
                var graphData = JSON.parse( datare );
                var axis = graphData.ERR;
                var dataToUse = [];
                var labelToUse = [];
                var currentDate;
                for (var i = 0 ; i < axis.length ; i++){
                    var temp = axis[i];
                    var tempDate = ((temp[1].split(" "))[1]).split(".")[0];
                    var tempVal = temp[0];
                    dataToUse.push(tempVal);
                    labelToUse.push(tempDate);
                }

                var ctxL = document.getElementById("lineChart").getContext('2d');
                var myLineChart = new Chart(ctxL, {
                    type: 'line',
                    data: {
                        labels: labelToUse,
                        datasets: [
                            {
                                label: "BER",
                                backgroundColor : "rgba(255, 99, 132, 0.2)",
                                borderWidth : 2,
                                borderColor : "rgba(255,99,132,1)",
                                pointBackgroundColor : "rgba(255,99,132,1)",
                                pointBorderColor : "rgba(255,99,132,1)",
                                pointBorderWidth : 1,
                                pointRadius : 4,
                                pointHoverBackgroundColor : "#fff",
                                pointHoverBorderColor : "",
                                data: dataToUse
                            }
                        ]
                    },
                    options: {
                        responsive: true
                    }
                });

            }
        );
    }
    // $scope.graphChanges = function(){
    //     me.sendingMessage.date = document.getElementById("date").value;
    //     console.log(document.getElementById("date").value);
    //     me.sendingMessage.request = 'getData';
    //     var data = StringToUint8Array(JSON.stringify(me.sendingMessage));
    //     ble.write(
    //       $stateParams.id,
    //       service_id,
    //       setDate_id,
    //       data.buffer,
    //       function(response){
    //
    //       },
    //       function(err){
    //         alert("Error occured while sending login information. Please try again.");
    //       }
    //     );
    //     dataReady = 0;
    //     getData(getData_id,
    //         function() {
    //             var ctx = document.getElementById("myChart").getContext('2d');
    //             var myChart = new Chart(ctx, {
    //                 type: 'bar',
    //                 data: {
    //                     labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    //                     datasets: [{
    //                         label: '# of Changes',
    //                         data: [12, 19, 3, 5, 2, 3],
    //                         backgroundColor: [
    //                             'rgba(255, 99, 132, 0.2)',
    //                             'rgba(54, 162, 235, 0.2)',
    //                             'rgba(255, 206, 86, 0.2)',
    //                             'rgba(75, 192, 192, 0.2)',
    //                             'rgba(153, 102, 255, 0.2)',
    //                             'rgba(255, 159, 64, 0.2)'
    //                         ],
    //                         borderColor: [
    //                             'rgba(255,99,132,1)',
    //                             'rgba(54, 162, 235, 1)',
    //                             'rgba(255, 206, 86, 1)',
    //                             'rgba(75, 192, 192, 1)',
    //                             'rgba(153, 102, 255, 1)',
    //                             'rgba(255, 159, 64, 1)'
    //                         ],
    //                         borderWidth: 1
    //                     }]
    //                 },
    //                 options: {
    //                     scales: {
    //                         yAxes: [{
    //                             ticks: {
    //                                 beginAtZero:true
    //                             }
    //                         }]
    //                     }
    //                 }
    //             });
    //
    //         }
    //     );
  }
})();
