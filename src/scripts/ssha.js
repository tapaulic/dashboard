var ssha = {
    service:{
           loadData: function (url) {
            },
           loadLiveData: function (url) {
           },
           drawChart:function(chartType,data,chartContainer){
           },
           drawDataTable:function(data,tableContainer){
           },
           exportData:function(exportType,data){

           }
        },
    dao:{
        getData:function (url) {
                 
          },
        getLiveData:function (url) {
         }        
       },
     entityBean:{
           chart:{
           googleChart:{
           },
           mxgraphChart:{
                  //Mxgraph constructor
                  MxgraphChart: function() {
                      alert("ok...");
                       },
                  //drawMxgraph     
                  drawMxgraph: function(container) {

                   },
                  //      
             },
           trafficLightChart:{



               }
           },
          table:{}, 
     }  
}
var mxgraphChart=new ssha.entityBean.chart.mxgraphChart.MxgraphChart();
mxgraphChart.drawMxgraph('myContainer');

