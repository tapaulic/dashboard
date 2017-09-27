var inter_handle_livedemandstream=null;
var dashboard; //THIS A GLOBAL VARIABLE TO YOUR FULL APPLICATION
var secondLabelVisible = true;
var arrMM = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var arrMMM = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var arrColors = [ "", "MidnightBlue", "Gray", "Orange", "Purple", "Brown", "LightCoral", "GreenYellow", "DarkTurquoise", "DarkOliveGreen", "IndianRed", "PaleVioletRed","Pink" ];
var arrSeason = [ "", "Winter", "Spring", "Summer", "Fall" ];
var App = function(sDisplaySel,
  sCategoryTabsSel,
  sIndicatorSel,
  sSourceListSel,
  sHTMLSource,
  sJSONMeasures,
  sJSONNarratives,
  sJSON_SSHA_LiveData,
  sJSON_SSHA_HistoricalDemandTrafficlightData,
  sJSON_SSHA_NightlySummaryTrafficlightData
) {
  this.selectors = { 'display': sDisplaySel, 'indicators': sIndicatorSel, 'sourcelist': sSourceListSel, 'tabs': sCategoryTabsSel};
  this.urls = { 'jsonmeasures': sJSONMeasures, 'jsonnarratives': sJSONNarratives,
                'jsonliveData':sJSON_SSHA_LiveData,//livedemandstreamData
                'jsonlhistoricaldemandtrafficlightData':sJSON_SSHA_HistoricalDemandTrafficlightData,
                'jsonlnightlysummarytrafficlightData':sJSON_SSHA_NightlySummaryTrafficlightData
};
  this.htmlsource = sHTMLSource;
  this.icons = { 'up' : '<span class="glyphicon glyphicon-arrow-up"></span>', 'down' : '<span class="glyphicon glyphicon-arrow-down"></span>', 'stable' : '<span class="glyphicon glyphicon-minus"></span>' };
};
var liveData={};
var trafficlightData={};

App.prototype.loadHTML = function() {
  var o = this;
  $( o.selectors.display ).load( o.htmlsource + ' ' + o.selectors.sourcelist, function() { o.loadData(); } );
};


App.prototype.loadData = function() {
  var o = this;
  $.ajax({ type: "GET", url: o.urls.jsonmeasures,  dataType: "json", success: function(data) { o.drawIndex(data); } });
  $.ajax({ type: "GET", url: o.urls.jsonnarratives,  dataType: "json", success: function(data) { o.narratives = data; } });
};

/*load traffic light data*/
App.prototype.loadTrafficLightData= function(urlOfTrafficLight){
  var o = this;
  trafficlightData={};
   $.ajax({ type: "GET", url: urlOfTrafficLight, async:false, dataType: "json", 
   error:function(jqXHR, exception){
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Due to network issues, the live stream is currently unavailable.';
    } else if (jqXHR.status == 404) {
        //msg = 'Requested page not found. [404]'+jqXHR.responseText.toString();
        msg = 'Requested page not found. [404]'
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Error reading data file.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    $('#post').html("<font size='2' color='red'>"+msg+"</font>");
    },
   success: function(data) {
    trafficlightData=data;
     $('#post').html("");
   }
  });
};



/*load live data*/
App.prototype.loadLiveData= function(){
  var o = this;
  liveData={};
   $.ajax({ type: "GET", url: o.urls.jsonliveData, async:false, dataType: "json", 
   error:function(jqXHR, exception){
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Due to network issues, the live stream is currently unavailable.';
    } else if (jqXHR.status == 404) {
        //msg = 'Requested page not found. [404]'+jqXHR.responseText.toString();
        msg = 'Requested page not found. [404]'
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Error reading data file.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    $('#post').html("<font size='2' color='red'>"+msg+"</font>");
    },
   success: function(data) {
     liveData=data;
     $('#post').html("");
   }
  });
};
 
App.prototype.drawIndex = function(d) {
  var o = this;
  $('#searchtext').keydown( function(e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if(key == 13) { o.search( $( '#searchtext' ).val() ); }
    if(key == 27) { o.resetsearch( '#searchtext' ); }
  });

  //key as measures from jsonfile
  o.measures = d.measures;
  $.each( d.categories, function(i,citem) {
    o.measures[citem] = [];
    o.createTab(citem, i );
  });

  d.measures.sort(function(a, b){	return (a.id - b.id);});


  $.each( d.measures, function(i,mitem) {
    o.measures[mitem.id] = mitem;
    m = mitem;
    $.each( mitem.c, function(j,ditem) {
      o.measures[ ditem ].push( m );
      o.drawMeasure( m, ditem );
  });//inner loop end
  });//out loop end

  $( "#measureChxBoxPDF" ).append( '<select id="pdfcat" multiple="multiple" style="display: none;"></select>' );
  $( "#measureChxBoxExcel" ).append( '<select id="excelcat" multiple="multiple" style="display: none;"></select>' );
  $.each( d.categories, function(i,citem) {
    $( "#pdfcat, #excelcat" ).append( '<optgroup label="' +  citem + '"></optgroup' );
    $.each(o.measures[ citem ], function(j, mitem) {
      $( "#pdfcat, #excelcat" ).append( '<option value="' + mitem.id + '">' + mitem.m + '</option>' );
    });
  });
  $( "#pdfcat, #excelcat").multiselect({includeSelectAllOption: true, numberDisplayed:1, enableClickableOptGroups: true, enableCollapsibleOptGroups: true});

  o.targets = d.targets[0];
  //alert(JSON.stringify(o.targets));

  $('.aindicator.nonactive').bind('click', function() { o.measureClick( this );});
  setConsistentHeightDASHBOARD("#dashboard_indicators", ".indicator h3");
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    setConsistentHeightDASHBOARD("#dashboard_indicators", ".indicator h3");
    setConsistentHeightDASHBOARD("#dashboard_indicators", ".explanation");
  });
  setConsistentHeightDASHBOARD("#dashboard_indicators", ".indicator h3");
  setConsistentHeightDASHBOARD("#dashboard_indicators", ".explanation");
};
App.prototype.measureClick = function( m ) {
  if ($( m ).hasClass("active")) {$( m ).removeClass("active"); return;}
  o = this;
  $( m ).unbind('click');
  $( m ).removeClass("nonactive");
  $( m ).addClass("active");
  $( ".aindicator" ).addClass("hide");
  $( ".aindicator.active, .aindicator.active .measuredetail" ).removeClass("hide");
  var row = this.measures[$(m).attr("id")];
  var category = row.c[0];
  if (row.chartType=="mxgraph" && category=="Live Stream"){
       o.loadLiveData();
       o.drawlivedemandstream.call(o,liveData['LSD']);
       inter_handle_livedemandstream=setInterval(function() {dashboard.reloadLiveData();}, 1000 * 6 * 1);
       return;
  }
  else if (row.chartType=="RYG"){
        //nightlysummarytrafficlight
       if (category=='Nightly Summary'){
        o.loadTrafficLightData(o.urls.jsonlnightlysummarytrafficlightData);
        o.drawtrafficlight.call(o,trafficlightData['RYG']);
        return;
      }
      // historicaldemandtrafficlight
       else if (category=='Historical Demand'){
        o.loadTrafficLightData(o.urls.jsonlhistoricaldemandtrafficlightData);
        o.drawtrafficlight.call(o,trafficlightData['RYG']);
        return;
        }
    }
  else {
      o.paintDetail.call(o, m );
      return;
  }
};
App.prototype.closeDetail = function() {
  if (inter_handle_livedemandstream!=null)
     clearInterval(inter_handle_livedemandstream);
  var o = this;
  delete this.chart;
  delete this.table;
  $( "#measurechart, #measuretable").remove();
  $( ".aindicator.active" ).removeAttr("style");
  $( ".aindicator.active .indicator .measurevalue, .aindicator.active .indicator .measureperiod, .aindicator.active .indicator .row, #dashboard_categorytabs, #dashboard_search .col-sm-8, #dashboard_nav" ).removeAttr("style");
  $( ".aindicator.active .measuredetail, #measurechart" ).html("");
  $( ".aindicator.active .measuredetail" ).addClass("hide");
  $( ".aindicator.active" ).addClass("nonactive");
  $( ".aindicator.active").bind('click', function() { o.measureClick( this );});
  $( ".aindicator" ).removeClass( "hide" );
  setConsistentHeightDASHBOARD("#dashboard_indicators", ".indicator h3");
};
/*
reload Live data and show on screen

*/ 
App.prototype.reloadLiveData = function() {
  $('#div_loading_1').css("display","block");
  var o = this;
  o.loadLiveData();
  data_LSD=liveData['LSD'];
  o.drawlivedemandstream.call(o,data_LSD);
};

App.prototype.getAnalysis = function(m, compVal1, compVal2, strTitle, blnTarget, blnYTD, blnYear, blnPeriod) {
  var sPOSNEG, sDIRECTION, sCHANGE, sHTML = "",sCURPER, sLASTPER, sCURVAL, sLASTVAL, sCOMMENT="", intDA;

  intDA = (m.da=="") ? 0 : parseInt(m.da);

  if (Math.abs(compVal1 - compVal2) <= Math.abs(compVal2 * (1+parseFloat(m.v)) - compVal2)) {
    sPOSNEG = "STABLE";
    sDIRECTION = "STABLE";
  } else {
    if ( compVal1 > compVal2) {sDIRECTION = "Up";} else {sDIRECTION = "Down";}
    if ( compVal1 > compVal2 && m.dd=="Up" ) {sPOSNEG = "POSITIVE";} else if (compVal1 < compVal2 && m.dd=="Down") {sPOSNEG = "POSITIVE";} else {sPOSNEG = "NEGATIVE";}
  }
  sCHANGE = (compVal1/compVal2-1) * 100;
  //sCHANGE = Math.abs(sCHANGE.toFixed(2)) + "%";
  //sCHANGE = (m.vt=="p") ? Math.abs((compVal1 - compVal2) * 100).toFixed(2) + "%" : sCHANGE;
  sCHANGE = sCHANGE.toFixed(2) + "%";
  sCHANGE = (sCHANGE=="Infinity%") ? "N/A" : sCHANGE;
  sCHANGE = (m.vt=="p") ? ((compVal1 - compVal2) * 100).toFixed(2) + "%" : sCHANGE;

  if (m.dd=="None") {sPOSNEG = "N/A";}

  sCOMMENT += strTitle + ": The ";
  sCOMMENT += (blnYTD) ? m.ytds.curYear + " " : m.vs[0].y + " ";

  if (blnYTD) {
    sCURPER = m.ytds.curYear + " ";
    sCURPER += (m.it=="m") ? arrMMM[m.ytds.curPeriod] : (m.it=="q") ? "Q" + m.ytds.curPeriod : (m.it=="s") ? arrSeason[m.ytds.curPeriod] : "";
    sCURPER += (blnYTD) ? " YTD" : "";
  } else {
    sCURPER = m.vs[0].y + " ";
    sCURPER += (m.it=="m") ? arrMMM[m.vs[0].p] : (m.it=="q") ? "Q" + m.vs[0].p : (m.it=="s") ? arrSeason[m.vs[0].p] : "";
  }

  if (blnTarget) {
    sLASTPER = "Budget/Target";
  } else {
    sLASTPER = (blnYear || blnYTD) ? "Previous Year" : (blnPeriod && m.it=="m") ? "Previous Month" : (blnPeriod && m.it=="q") ? "Previous Quarter" : (blnPeriod && m.it=="s") ? "Previous Season" : "Previous Year";
  }

  sCURVAL = (m.vt=="n") ? numberWithCommasAbbr(compVal1, intDA) : (m.vt=="c") ? "$" + numberWithCommasAbbr(compVal1, intDA) : (compVal1 * 100).toFixed(intDA) + "%";
  sCOMMENT += sCURPER + " Result was " + sCURVAL;

  sLASTVAL = (m.vt=="n") ? numberWithCommasAbbr(compVal2, intDA) : (m.vt=="c") ? "$" + numberWithCommasAbbr(compVal2, intDA) : (compVal2 * 100).toFixed(intDA) + "%";
  if (blnTarget) {
    if (sPOSNEG=="STABLE") {
      sCOMMENT += " which was STABLE vs. budget";
    } else {
      sCOMMENT += " which was " + sCHANGE + " " ;
      sCOMMENT += (sDIRECTION=="Up") ? "higher" : "lower";
      sCOMMENT += " than the budget/target of ";
      sCOMMENT += sLASTVAL;
    }
  } else {
    sCOMMENT += " which was " + sDIRECTION + " from ";
    sCOMMENT += sLASTVAL;
    sCOMMENT += (sPOSNEG=="STABLE") ? "" : " by " + sCHANGE;
    sCOMMENT += (blnYear) ? " from last year at this time" : "";
    if (blnPeriod) {sCOMMENT += (m.it=="m") ? " from last month" : (m.it=="q") ? " from last quarter" : (m.it=="s") ? " from last season" : " from last year";}
    sCOMMENT += (blnYTD) ? " in " + (m.ytds.curYear - 1) : "";
  }

  sHTML += "<tr class='" + sPOSNEG + "' title='" + sCOMMENT + "'>";
  sHTML += "<td>" + strTitle + "</td>";
  sHTML += "<td>" + sCURPER + ": " + sCURVAL + "</td>";
  sHTML += "<td>" + sLASTPER + ": " + sLASTVAL + "</td>";
  sHTML += "<td>" + sCHANGE + "</td>";
  sHTML += "<td>" + o.drawSymbol(sPOSNEG, sDIRECTION) + properCase(sPOSNEG);
  sHTML += (sPOSNEG=="STABLE" || sPOSNEG=="N/A") ? "" : " direction</td>";
  sHTML += "</tr>";
  return sHTML;
};
/*drawmxgraph*/
//App.prototype.drawmxgraph = function (container,dataSource){
function drawmxgraph (container,dataSource){
    if (!mxClient.isBrowserSupported()){
      mxUtils.error('Browser is not supported!', 200, false);
    }
    else{
      mxEvent.disableContextMenu(container);
      var graph = new mxGraph(container);
      var parent = graph.getDefaultParent();
      var data=dataSource;
      graph.getSecondLabel = function(cell){
        if (!this.model.isEdge(cell)&&secondLabelVisible==true){
          var value=getSecondLableValueByID(cell.getId(),data.vertexes);
          return  value;
        }
        return null;
      };
      var relativeChildVerticesVisible = true;
      graph.isCellVisible = function(cell){
        return !this.model.isVertex(cell) || cell.geometry == null ||
          !cell.geometry.relative ||
          cell.geometry.relative == relativeChildVerticesVisible;
      };
      var redrawShape = graph.cellRenderer.redrawShape;
      graph.cellRenderer.redrawShape = function(state, force, rendering){
        var result = redrawShape.apply(this, arguments);
        if (result && secondLabelVisible && state.cell.geometry != null && !state.cell.geometry.relative){
          var secondLabel = graph.getSecondLabel(state.cell);
          if (secondLabel != null && state.shape != null && state.secondLabel == null){
            state.secondLabel = new mxText(secondLabel, new mxRectangle(),
              mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM);
            //state.secondLabel.color = 'black';
            state.secondLabel.color = getSecondLabelColorByID(state.cell.getId(),data.vertexes);
            //state.secondLabel.family = 'Verdana';
            state.secondLabel.family =getSecondLabelFontNameByID(state.cell.getId(),data.vertexes);
            //state.secondLabel.size = 10;
            state.secondLabel.size = getSecondLabelFontSizeByID(state.cell.getId(),data.vertexes);
            //state.secondLabel.fontStyle = mxConstants.FONT_ITALIC;
            //state.secondLabel.background = 'lightgreen';
            state.secondLabel.background = getSecondLabelBackGroundColorByID(state.cell.getId(),data.vertexes);
            //state.secondLabel.valign = 'top';
            state.secondLabel.valign = getSecondLabelValignByID(state.cell.getId(),data.vertexes);
            state.secondLabel.dialect = state.shape.dialect;
            state.secondLabel.dialect = mxConstants.DIALECT_STRICTHTML;
            state.secondLabel.wrap = true;
            graph.cellRenderer.initializeLabel(state, state.secondLabel);
          }
        }

        if (state.secondLabel != null)
        {
          var scale = graph.getView().getScale();
          var bounds = new mxRectangle(state.x + state.width - 8 * scale, state.y + 8 * scale, 35, 0);
          state.secondLabel.state = state;
          state.secondLabel.value = graph.getSecondLabel(state.cell);
          state.secondLabel.scale = scale;
          state.secondLabel.bounds = bounds;
          state.secondLabel.redraw();
        }

        return result;
      };

      // Destroys the shape number
      var destroy = graph.cellRenderer.destroy;
      graph.cellRenderer.destroy = function(state){
        destroy.apply(this, arguments);
        if (state.secondLabel != null){
          state.secondLabel.destroy();
          state.secondLabel = null;
        }
      };
      graph.cellRenderer.getShapesForState = function(state){
        return [state.shape, state.text, state.secondLabel, state.control];
      };
      /*end */
      /*start of font size change*/
      graph.processChange = function(change){
        if (change instanceof mxGeometryChange) {
          this.view.removeState(change.cell);
        }
        mxGraph.prototype.processChange.apply(this, arguments);
      };
      // Returns dynamic fontsize based on geometry
      graph.model.getStyle = function(cell){
        var geometry = this.getGeometry(cell);
        var fs = mxConstants.DEFAULT_FONTSIZE;
        if (geometry != null)  {
          fs = Math.max(fs, geometry.width/10);
        }
        return mxGraphModel.prototype.getStyle.apply(this, arguments) + ';fontSize=' + fs;
      };

      /*end of font size change*/
      new mxRubberband(graph);
      //graph.isCellMoveable(true);
      graph.setEnabled(true);
      graph.setHtmlLabels(true);
      graph.setCellsLocked(true);
      graph.setConnectable(true);
      graph.setTooltips(false);
      graph.setAllowDanglingEdges(false);
      //graph.setAllowDanglingEdges(true);
      graph.setMultigraph(false);
      graph.setAutoSizeCells(true);
      graph.setCellsResizable(false);
      graph.setCellsMovable(false);

      //	graph.setCellsMovable(true);
      //graph.centerZoom = false;
      graph.centerZoom = true;
      graph.setCellsSelectable(false);

      var style_cell = new Object();
      style_cell[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
      style_cell[mxConstants.STYLE_CURVED] = '1';
      graph.getStylesheet().putCellStyle('myshape', style_cell);
      var style =graph.getStylesheet().getDefaultEdgeStyle();
      //style[mxConstants.STYLE_EDGE] = mxEdgeStyle.TopToBottom;
      //style[mxConstants.STYLE_CURVED] = true;
      style[mxConstants.STYLE_ROUNDED] = true;
      //style[mxConstants.STYLE_ROUNDED]=true;
      //style[mxConstants.STYLE_EDGE]=mxConstants.EDGESTYLE_ENTITY_RELATION;
      //style[mxConstants.STYLE_SHAPE]=mxConstants.SHAPE_ELLIPSE;
      //mxCoordinateAssignment.prototype.edgeStyle = mxHierarchicalEdgeStyle.CURVE;
      style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;
      graph.getStylesheet().putDefaultEdgeStyle(style);
      //graph.alternateEdgeStyle = 'elbow=vertical';
      graph.getModel().beginUpdate();
      try
      {

        //get vertexes
        var X2={}; //my namespace:)
        // var v_tmp={};
        ;                  X2.Eval=function(code){
        if(!!(window.attachEvent && !window.opera)){//ie
          execScript(code);
        }else{
          window.eval(code);
        }
      }
        var vertexes=data['vertexes'];
        var vertext_name='';
        var model=graph.getModel();
        var vertex_data_array=new Array();
        for (var key in vertexes) {
          if (vertexes.hasOwnProperty(key)) {
            var id= vertexes[key].id;
            var value=vertexes[key].value;
            var left=vertexes[key].left;
            var top=vertexes[key].top;
            var width=vertexes[key].width;
            var height=vertexes[key].height;
            var style=vertexes[key].style;
            //var parentCell=graph.insertVertex(parent, '1000', '',0,0,400,400,style,true);
            v_tmp=graph.insertVertex(parent, id, value,left,top,width,height,style,false);
            //v_tmp=graph.insertVertex(parentCell, id, value,left,top,width,height,style,true);
            vertext_name=vertexes[key].id;
            X2.Eval('var '+ vertext_name+'='+'v_tmp'+';');
            vertex_data_array.push({'id':id,'vertex':v_tmp});
            model.setValue(v_tmp,value);//update model
          }
        }//end loop vertexes

        /*get edges*/
        var edges=data['edges'];
        var edge_name='';
        //start to loop edge
        for (var key in edges) {
          if (edges.hasOwnProperty(key)) {
            var id= edges[key].id;
            var value=edges[key].value;
            var from=getVertexByID(vertex_data_array,edges[key].from);
            var to=getVertexByID(vertex_data_array,edges[key].to);
            //var style=edges[key].style;
            var style=graph.getStylesheet().getDefaultEdgeStyle();
            // e_tmp=graph.insertEdge(parent, null, '', from,to,'edgeStyle=elbowConnector;');
            e_tmp=graph.insertEdge(parent, null, '', from,to,style);
            //e_tmp=graph.insertEdge(parentCell, null, '', from,to,'edgeStyle=elbowConnector;');
            edge_name=edges[key].id;
            X2.Eval('var '+ edge_name+'='+'e_tmp'+';');
          }

        }//end loop edges
      }
      finally
      {
        // Updates the display
        graph.getModel().endUpdate();
      }

    }
};
function getVertexByID(vertexes_array,vertexID){
  for (var i = 0; i < vertexes_array.length; i++) {
    if (vertexes_array[i].id==vertexID){
      var v=vertexes_array[i].vertex;
      return  v;
    }
  }
}
function getSecondLableValueByID(vertexID,vertexList){
  for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.value; 
  }
  }
}


function getSecondLabelColorByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.color; 
  }
  }

}

function getSecondLabelFontNameByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.family; 
  }
  }



}

function getSecondLabelFontSizeByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.size; 
  }
  }
}

function getSecondLabelFontSizeByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.size; 
  }
  }
}




function getSecondLabelBackGroundColorByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.background; 
  }
  }
}

function getSecondLabelValignByID(vertexID,vertexList){
for (var key in vertexList){
      if (vertexList.hasOwnProperty(key)){
          var  cellID= vertexList[key].id;
  if  (cellID==vertexID)
       return vertexList[key].secondLabel.valign; 
  }
  }
}

function drawtabledata(container,data){
  var datatable = new google.visualization.DataTable(data);
  var table = new google.visualization.Table(container);
  table.draw(datatable,{showRowNumber: false, width: '90%', height: '100%',page:'enable',pageSize:'20'});
  return datatable;
}
function drawtabledata_1(container,data){
  var datatable = new google.visualization.DataTable(data);
  var table = new google.visualization.Table(container);
  table.draw(datatable,{showRowNumber: false, width: '75%', height: '100%',page:'enable',pageSize:'20'});
  return datatable;
}
/*drawlivedemandstream*/
App.prototype.drawlivedemandstream= function(data ) {
  var o = this;
  var data_mxgraph=data['LSD_MXGRAPH'];
  var data_datatable=data['LSD_DATATABLE'];
  var strHTML =""+
  "<div  class='btn-group'>"+
  "<div id ='div_btn_closeDetail' class='col-xs-12 col-md-6'>"+
   "<button id='closeDetail' disabled disabled class='btn btn-primary' type='button' onclick='window.dashboardapp.closeDetail()'><span class='glyphicon glyphicon-arrow-left'></span><span class='btntext'>Back</span></button>"+
   "</div>"+
  "</div>"+
  "<font size='2'><strong><div id='div_loading_1'>"+
  //"<img src='/resources/dashboard/img/Preloader_1.gif' width=32 height=32/>"+
  "<img src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
  "</div></strong></font>"+
  "<h4 class='tabletitle'>"+"Chart:Live Demand Stream"+"</h4>"+
  //"<section id='chartcontrols'>"+
  "<section id='chartcontrols_1'>"+
  //"<img id='loading1' src='/resources/dashboard/img/Preloader_1.gif' width=32 height=32/>"+
  "<img id='loading1' src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
  "</section>"+
 "<div class='tabletitle'><h4>"+"Data Table:Live Demand Stream"+"</h4>"+
 "<button id='excelexport' disabled disabled  class='btnbs btn-primary popoverbs' type='button' onclick='' data-placement='top'  title='Export this data into an excel spreadsheet'>"+
 "<img src='/resources/dashboard/img/csv.png' alt='Excel Icon'/>"+
  "Export Data</button>"+
 "</div>"+
 "<section id='chartcontrols_2' class='chartcontrols'>"+
 //"<img id='loading2' src='/resources/dashboard/img/Preloader_1.gif' width=32 height=32/>"+
 "<img id='loading2' src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
 "<div id='div_livedemandstream_datatable'></div>";
 "</section>"
 strHTML += (o.narratives[m.id]!= null) ? "<section id='narrative'><h4 class='narrative'>Notes</h4>" + o.narratives[m.id] + "</section>" : "";    
$( ".aindicator.active .indicator .measurevalue, .aindicator.active .indicator .measureperiod, .aindicator.active .indicator .row, #dashboard_categorytabs, #dashboard_search .col-sm-8, #dashboard_nav" ).animate({
    opacity: 0,
    height: 1
 }, 900 );
 
 $( ".aindicator.active .measuredetail" ).html( strHTML );
 $( ".aindicator.active .measuredetail" ).animate({
    opacity: 1
  }, 1 );
  $( ".aindicator.active" ).animate({
    width: "100%"
  }, 1000, function(){
    $('#chartcontrols_1').append("<div  id='div_livedemandstream_mxgraph' style='display: table; margin: 0 auto;'></div>");
    $('#chartcontrols_1').append("<br/>");
    $('#chartcontrols_1').append("<br/>");
    $('#div_livedemandstream_mxgraph').html("");
    $('#div_livedemandstream_datatable').html("");
    $('#div_loading_1').css("display","block");
      var container_mxgraph =$('#div_livedemandstream_mxgraph').get(0);
      drawmxgraph(container_mxgraph,data_mxgraph);
       $('#chartcontrols_1').children("#loading1").remove();
      var container_table=$('#div_livedemandstream_datatable')[0];
      var dataTable=new google.visualization.DataTable();
      dataTable=drawtabledata(container_table,data_datatable);
      $('#chartcontrols_2').children("#loading2").remove();
      $('#div_loading_1').text("As of: "+getCurrentTime());
      $('#closeDetail').prop('disabled', false);
      $('#excelexport').prop('disabled', false);
      $("#excelexport").click(function(){
        o.downloadLiveCSV(dataTable);
    });

   }
  );
};

 /*draw RBG*/
 function drawRYG(dataset,options){
var options_M=options['M'];
var options_R=options['R'];
var options_Y=options['Y'];
var options_G=options.G;
var options_R_V=options.R_V;
var options_Y_V=options.Y_V;
var options_G_V=options.G_V;
var value_R=dataset.R;
var value_Y=dataset.Y;
var value_G=dataset.G;
$("#ryg_div").css(options_M);
$("#r_div").css(options_R);
$("#y_div").css(options_Y);
$("#g_div").css(options_G);
$("#r_value_div").css(options_R_V);
$("#y_value_div").css(options_Y_V);
$("#g_value_div").css(options_G_V);
$('#r_value_div').html(value_R);
$('#y_value_div').html(value_Y);
$('#g_value_div').html(value_G);
};

App.prototype.drawtrafficlight = function(data) {
  var o = this;
  var dataset=data["dataset"];
  var options=data["options"];
  var data_datatable=data['RYG_DATATABLE'];
  var data_datatable_1=data['RYG_DATATABLE_1'];
  var strHTML =""+
  "<div  class='btn-group'>"+
  "<div id ='div_btn_closeDetail' class='col-xs-12 col-md-6'>"+
   "<button id='closeDetail' disabled disabled class='btn btn-primary' type='button' onclick='window.dashboardapp.closeDetail()'><span class='glyphicon glyphicon-arrow-left'></span><span class='btntext'>Back</span></button>"+
   "</div>"+
  "</div>"+
  "<font size='2'><strong><div id='div_loading_1'>"+
  "<img src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
  "</div></strong></font>"+
  "<h4 class='tabletitle'>"+"Chart:R.Y.G"+"</h4>"+
  "<section id='chartcontrols_3'>"+
  "<img id='loading1' src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
  "<div id='trafficLight_div' style='display: table;  margin: 0 auto;border:none; text-align: center;'>"+
  "<div id='ryg_div' style='display:inline;border:none;vertical-align: middle;text-align:center;'>"+
  "<div id='r_div'><div id='r_value_div' style='color:white'></div></div>"+
  "<div id='y_div'><div id='y_value_div' style='color:white'></div></div>"+
  "<div id='g_div'><div id='g_value_div' style='color:white'></div></div>"+
   "</div>"+
   "<div id='div_RYG_datatable_1' style='display:inline;'></div>"+ 
  //"<div id='div_RYG_datatable_1'></div>"+ 
   "</div>"+
  "</section>"+
 "<div class='tabletitle'><h4>"+"Data Table:R.Y.G"+"</h4>"+
 "<button id='excelexport' disabled disabled  class='btnbs btn-primary popoverbs' type='button' onclick='' data-placement='top'  title='Export this data into an excel spreadsheet'>"+
 "<img src='/resources/dashboard/img/csv.png' alt='Excel Icon'/>"+
  "Export Data</button>"+
 "</div>"+
 "<section id='chartcontrols_2' class='chartcontrols'>"+
 "<img id='loading2'  src='/resources/dashboard/img/Spinner.svg' width=32 height=32/>"+
 "<div id='div_RYG_datatable'></div>"+
 "</section>";
 strHTML += (o.narratives[m.id]!= null) ? "<section id='narrative'><h4 class='narrative'>Notes</h4>" + o.narratives[m.id] + "</section>" : "";
 $( ".aindicator.active .indicator .measurevalue, .aindicator.active .indicator .measureperiod, .aindicator.active .indicator .row, #dashboard_categorytabs, #dashboard_search .col-sm-8, #dashboard_nav" ).animate({
    opacity: 0,
    height: 1
 }, 900 );
 
 $( ".aindicator.active .measuredetail" ).html( strHTML );
 $( ".aindicator.active .measuredetail" ).animate({
    opacity: 1
  }, 1 );
  $( ".aindicator.active" ).animate({
    width: "100%"
  }, 1000, function(){
    $('#div_RYG_datatable').html("");
    $('#div_loading_1').css("display","block");
      var container_mxgraph =$('#ryg_div').get(0);
      drawRYG(dataset,options);
       $('#chartcontrols_3').children("#loading1").remove();
      var container_table=$('#div_RYG_datatable')[0];
      var container_table_1=$('#div_RYG_datatable_1')[0];
      var dataTable_1=new google.visualization.DataTable();
      var dataTable_1=drawtabledata_1(container_table_1,data_datatable_1);
      var dataTable=new google.visualization.DataTable();
      dataTable=drawtabledata(container_table,data_datatable);
      $('#chartcontrols_2').children("#loading2").remove();
      $('#div_loading_1').text("As of: "+getCurrentTime());
      $('#closeDetail').prop('disabled', false);
      $('#excelexport').prop('disabled', false);
      $("#excelexport").click(function(){
        o.downloadLiveCSV(dataTable);
    });

   }
  );
  
};
App.prototype.paintDetail = function( indicator ) {

  var o = this;
  var m = this.measures[$(indicator).attr("id")];
  strHTML = '<button id="closeDetail" class="btn btn-primary" type="button" onclick="window.dashboardapp.closeDetail()"><span class="glyphicon glyphicon-arrow-left"></span> <span class="btntext">Back</span></button>';
  var compVal1, compVal2, sPOSNEG, sDIRECTION, sCHANGE, sHTMLTREND="";
  /*
  sHTMLTREND = "<h4>Trend Analysis</h4>";
  if (m.vt=="p") {
    sHTMLTREND += "<table class='table table-bordered'><tr><th>Trend</th><th>Current Value</th><th>Comparison Value</th><th>Percentage Point Changed</th><th>Analysis</th></tr>";
  } else {
    sHTMLTREND += "<table class='table table-bordered'><tr><th>Trend</th><th>Current Value</th><th>Comparison Value</th><th>% Changed</th><th>Analysis</th></tr>";
  }
  m.vs.sort(function(a, b){	return ( ((b.y * 1000) + b.p) - ((a.y *1000) + a.p));});
  if (m.ytd=="True") {
    //DRAW YTD ANALYSIS
    compVal1 = m.ytds[m.ytds.curYear][m.ytds.curPeriod];compVal2 = m.ytds[m.ytds.curYear - 1][m.ytds.curPeriod];
    sHTMLTREND += o.getAnalysis(m, compVal1, compVal2, "Current Year-To-Date vs. Previous Year", false, true, false, false);

    if (m.ht=="True") {
      //DRAW TARGET YTD ANALYSIS
      compVal1 = m.ytds[m.vs[0].y][m.vs[0].p]; compVal2 = 0;
      $.each (this.targets[$(indicator).attr("id")], function(i,item) {if (item.y == m.vs[0].y && item.p <= m.vs[0].p) {compVal2 += item.v;}});
      if (compVal2 != 0) {sHTMLTREND += o.getAnalysis(m, compVal1, compVal2, "Current Year-To-Date vs. Budget/Target", true, true, false, false);}
    }
  }

  //DRAW YEARLY PERIOD ANALYSIS
  if (m.it!="y") {
    compVal1 = m.vs[0].v;
    compVal2 = (m.it=="m") ? m.vs[12].v : m.vs[4].v;
    sHTMLTREND += o.getAnalysis(m, compVal1, compVal2, "Current Period vs. Last Year At This Time", false, false, true, false);
  }


  //DRAW PERIOD ANALYSIS
  compVal1 = m.vs[0].v;
  compVal2 = m.vs[1].v;
  sHTMLTREND += o.getAnalysis(m, compVal1, compVal2, "Current Period vs. Last Period", false, false, false, true);

  //DRAW TARGET PERIOD ANALYSIS
  if (m.ht=="True") {
    compVal1 = m.vs[0].v;
    compVal2 = "";
    $.each (this.targets[$(indicator).attr("id")], function(i,item) {
      if (item.y == m.vs[0].y && item.p == m.vs[0].p) {
        compVal2 = item.v;
      }
    });
    if (compVal2 != "") {
      sHTMLTREND += o.getAnalysis(m, compVal1, compVal2, "Current Period vs. Budget/Target", true, false, false, true);
    }
  }
  sHTMLTREND += "</table>";
*/
  strHTML += "<div class='analysis'>";
  strHTML += "<div class='table-responsive'>" + sHTMLTREND  + "</div>";
  strHTML += (m.cp == "") ? "" : "<p class='cityperspective'>" + m.cp + "</p>";
  strHTML += "</div>";

  var strP = (getType(m)=="MONTHLY") ? "Month" : (getType(m)=="QUARTERLY") ? "Quarter" : (getType(m)=="SEASONAL") ? "Season" : "Year";
  var strCl = (m.ytd=="True") ? "col-xs-12 col-md-4" : "col-xs-12 col-md-6";

  var strType = '<div id="graphtype"><label>Chart Type</label><div class="btn-group" data-toggle="buttons">';
  strType += '<label onclick="o.changegraphtype(\'bars\');" class="btn btn-default active" title="Change the chart below to a Bar Chart"><input type="radio" name="options" id="barchart" autocomplete="off" checked><img src="/resources/dashboard/img/combo.png" alt="Bar chart icon"/></label>';
  strType += '<label onclick="o.changegraphtype(\'line\')" class="btn btn-default" title="Change the chart below to a Line Chart"><input type="radio" name="options" id="linechart" autocomplete="off"><img src="/resources/dashboard/img/line.png" alt="Line chart icon"/></label>';
  strType += '</div></div>';
  var strContext = '<div class="' + strCl + ' groupbyperiod"><label for="groupbyperiod">Group by ' + strP + '</label><input type="checkbox" id="groupbyperiod" name="groupbyperiod" data-on-text="Yes" data-off-text="No" data-handle-width="50" checked></div>';
  strContext += (m.ytd=="True") ? '<div class="' + strCl + '"><label for="showytdvalues">Show Year-To-Date Values</label><input type="checkbox" id="showytdvalues" name="showytdvalues" data-on-text="Yes" data-off-text="No"  data-handle-width="50" checked></div>' : '';
  strContext += '<div class="' + strCl + '">' + strType + '</div>';
  var strYears = '<div id="graphyear"><p>Years to Display on Chart</p><div class="btn-group" data-toggle="buttons"></div></div>';

  var sChartTitle = properCase(getType(m)) + ((this.contexttype=="ytd") ? " (Year-To-Date) " : " ") + "Values for " + m.m.replace(/\n/g,' - ');
  strHTML += '<h4 class="controlstitle">Chart Options</h4><section id="chartcontrols"><div class="col-xs-12">' + strContext + '</div><div class="col-xs-12">' + strYears + '</div></section>';
  strHTML += "<h4 class='charttitle'>Chart: " + sChartTitle + "</h4><div id='measurechart'></div>";
  strHTML += (m.ds=="") ? "" : "<p class='datasource'>" + m.ds + "</p>";
  strHTML += "<div class='tabletitle'><h4>Data Table: " + sChartTitle +"</h4><button id='excelexport' onclick='o.downloadCSV();' class='btnbs btn-primary popoverbs' title='Export this data into an excel spreadsheet' data-placement='top'><img src='/resources/dashboard/img/csv.png' alt='Excel Icon'/> Export Data</button></div><div id='measuretable'></div>";
  strHTML += (o.narratives[m.id]!= null) ? "<section id='narrative'><h4 class='narrative'>Notes</h4>" + o.narratives[m.id] + "</section>" : "";
  o.charttype="bars";
  if (m.ytd=="True") {o.contexttype="ytd";} else {o.contexttype="period";}
  m.activeYears = {};
  var intLoop = (getType(m)=="YEARLY" || o.contexttype=="seq") ? 15 : 3;
  for (var x = 0; x < intLoop; x++) {
    m.activeYears[new Date().getFullYear() - x] = true;
  }
  
  $( ".aindicator.active" ).animate({
    width: "100%"
  }, 1000, function() {
    o.createGraph( m );
  });
  
  $( ".aindicator.active .indicator .measurevalue, .aindicator.active .indicator .measureperiod, .aindicator.active .indicator .row, #dashboard_categorytabs, #dashboard_search .col-sm-8, #dashboard_nav" ).animate({
    opacity: 0,
    height: 1
  }, 900 );
  
  $( ".aindicator.active .measuredetail" ).html( strHTML );
  $( ".aindicator.active .measuredetail" ).animate({
    opacity: 1
  }, 1000 );
  
  
  //ACTIVATE SWITCHES
  $("#groupbyperiod, #showytdvalues").bootstrapSwitch();
  
  $('#groupbyperiod').on('switchChange.bootstrapSwitch', function(event, state) {
    o.selectGroupByPeriod();
  });
  
  $('#showytdvalues').on('switchChange.bootstrapSwitch', function(event, state) {
    o.selectYTD();
  });
  
};
function getType(measure) {
  return (measure.it=="m") ? "MONTHLY" : (measure.it=="q") ? "QUARTERLY" : (measure.it=="y") ? "YEARLY" : "SEASONAL";
};
function hasTarget(measure) {
  return (measure.ht=="True") ? true : false;
};
function properCase(s) {
  var rVal = (s =="N/A") ? "N/A" : s.charAt(0).toUpperCase() + (s.slice(1)).toLowerCase();
  return rVal;
};
function getPeriodName(measure, period) {
  var strReturn = "";
  switch(getType(measure)) {
    case "MONTHLY":
      strReturn = arrMM[period];
      break;
    case "QUARTERLY":
      strReturn = "Q" + period;
      break;
    case "SEASONAL":
      strReturn = arrSeason[period];
      break;
    default:
      strReturn = period;
  }
  return strReturn;
};
App.prototype.setDataRows = function(mm) {
  var o = this;
  var intDA;
  var arrRows = [], oData = {}, fmt, intTarget, intSumTarget= 0;

  intDA = (mm.da=="") ? 0 : parseInt(mm.da);

  mm.vs.sort(function(a, b){	return ( ((a.p * 1000) + a.y) - ((b.p *1000) + b.y));});
  if (this.contexttype=="ytd") {
    for (var i = 0; i < mm.vs.length; i++ ) {
      if (oData[mm.vs[i].y]==null) {
        oData[mm.vs[i].y] = [];
        oData[mm.vs[i].y].push( mm.vs[i].y + " YTD Actual" );
      }
      if (mm.activeYears[mm.vs[i].y] != null) {
        fmt = (mm.vt=="c") ? "$" + numberWithCommas(mm.ytds[mm.vs[i].y][mm.vs[i].p], intDA) : numberWithCommas(mm.ytds[mm.vs[i].y][mm.vs[i].p], intDA);
        oData[mm.vs[i].y].push( {v: mm.ytds[mm.vs[i].y][mm.vs[i].p], f: fmt} );
      }
    }
    if ( hasTarget( mm ) ) {
      intTarget = o.targets[mm.id].length - 1;
      oData.target = [];
      oData.target.push( o.targets[mm.id][intTarget].y + " Target");
      $.each (o.targets[mm.id], function(i,item) {
        if (item.y == o.targets[mm.id][intTarget].y) {
          intSumTarget += item.v;
          fmt = (mm.vt=="c") ? "$" + numberWithCommas(intSumTarget, intDA) : numberWithCommas(intSumTarget, intDA);
          oData.target.push( {v: intSumTarget, f: fmt} );
        }
      });
    }
  } else if (this.contexttype=="seq") {
    mm.vs.sort(function(a, b){	return ( ((a.y * 1000) + a.p) - ((b.y *1000) + b.p));});
    for (var i = 0; i < mm.vs.length; i++ ) {
      if (oData[(mm.vs[i].y * 1000 + mm.vs[i].p).toString()]==null) {
        oData[(mm.vs[i].y * 1000 + mm.vs[i].p).toString()] = [];
        oData[(mm.vs[i].y * 1000 + mm.vs[i].p).toString()].push( getPeriodName(mm, mm.vs[i].p) + " " + mm.vs[i].y.toString());
      }
      if (mm.activeYears[mm.vs[i].y] != null) {
        fmt = (mm.vt=="c") ? "$" + numberWithCommas(mm.vs[i].v, intDA) : (mm.vt=="p") ? ( mm.vs[i].v * 100 ).toFixed(intDA) + "%" : numberWithCommas(mm.vs[i].v, intDA);
        oData[(mm.vs[i].y * 1000 + mm.vs[i].p).toString()].push( {v: mm.vs[i].v, f: fmt} );
      }
    }
  } else 	{
    //LOAD PERIOD VALUES
    for (var i = 0; i < mm.vs.length; i++ ) {
      if (oData[mm.vs[i].y]==null) {
        oData[mm.vs[i].y] = [];
        oData[mm.vs[i].y].push( mm.vs[i].y + " Actual" );
      }
      if (mm.activeYears[mm.vs[i].y] != null) {
        fmt = (mm.vt=="c") ? "$" + numberWithCommas(mm.vs[i].v, intDA) : (mm.vt=="p") ? ( mm.vs[i].v * 100 ).toFixed(intDA) + "%" : numberWithCommas(mm.vs[i].v, intDA);
        oData[mm.vs[i].y].push( {v: mm.vs[i].v, f: fmt} );
      }
    }
    //LOAD TARGET VALUES
    if ( hasTarget( mm ) ) {
      intTarget = o.targets[mm.id].length - 1;
      oData.target = [];
      oData.target.push( o.targets[mm.id][intTarget].y + " Target");
      $.each (o.targets[mm.id], function(i,item) {
        if (item.y == o.targets[mm.id][intTarget].y) {
          fmt = (mm.vt=="c") ? "$" + numberWithCommas(item.v, intDA) : (mm.vt=="p") ? ( item.v * 100 ).toFixed(intDA) + "%" : numberWithCommas(item.v, intDA);
          oData.target.push( {v: item.v, f: fmt} );
        }
      });
    }
  }


  var reqLen =(mm.it=="m") ? 13 : (mm.it=="y") ? 2 : 5;
  reqLen = (this.contexttype=="seq") ? 2 : reqLen;
  var blnDelete;
  for (var z = 0; z < Object.keys(oData).length; z++) {
    blnDelete = false;
    //MARK ROWS WHERE THERE ARE NO VALUES FOR DELETION
    if (oData[Object.keys(oData)[z]].length == 1) {blnDelete = true;}
    //ADD NULLS TO YEAR ROWS WITH IMCOMPLETE DATA
    if (oData[Object.keys(oData)[z]].length < reqLen) {
      for (var q = oData[Object.keys(oData)[z]].length + 1; q <= reqLen; q++) {
        oData[Object.keys(oData)[z]].push(null);
      }
    }
    //DELETE ROWS WHERE THERE ARE NO VALUES FOR ANY OF THE PERIODS
    if (!blnDelete) {
      arrRows.push(oData[Object.keys(oData)[z]]);
    }
  }
  this.datarows = arrRows;
};
App.prototype.setChartRows = function( mm ) {
  var arrRows = this.datarows;
  arrRows = transpose( arrRows );
  arrRows.splice(0, 1);
  if (getType(mm)=="MONTHLY" && this.contexttype != "seq") {for (var z = 0; z <= 11; z++) {arrRows[z].unshift(arrMM[z+1]);}}
  if (getType(mm)=="QUARTERLY" && this.contexttype != "seq") {for (var z = 0; z <= 3; z++) {arrRows[z].unshift("Q" + (z+1));}}
  if (getType(mm)=="SEASONAL" && this.contexttype != "seq") {arrRows[0].unshift("Winter");arrRows[1].unshift("Spring");arrRows[2].unshift("Summer");arrRows[3].unshift("Fall");}
  if (getType(mm)=="YEARLY" || this.contexttype == "seq") {arrRows[0].unshift("Year");}
  this.chartrows = arrRows;
};
App.prototype.createGraph = function(mm) {
  var o = this;
  var arrRows = [];
  var oSeries = {}, oAxes = {}, intRows=0;
  var dt = new google.visualization.DataTable();
  var dtChart = new google.visualization.DataTable();
  var transposeTitles = [];
  var fmt;

  //BUILD DATA TABLE STRUCTURE
  dt.addColumn( 'string', 'Year' );
  dtChart.addColumn( 'string', 'Period' );
  if (getType(mm)=="MONTHLY" && this.contexttype != "seq") {for (var x = 1; x <= 12; x++) {dt.addColumn('number', arrMM[x]);}}
  if (getType(mm)=="QUARTERLY" && this.contexttype != "seq") {for (var x = 1; x <= 4; x++) {dt.addColumn('number', "Q" + x);}}
  if (getType(mm)=="YEARLY" || o.contexttype=="seq") {dt.addColumn('number', mm.m.replace(/\n/g,' '));}
  if (getType(mm)=="SEASONAL" && this.contexttype != "seq") {dt.addColumn('number', "Winter");dt.addColumn('number', "Spring");dt.addColumn('number', "Summer");dt.addColumn('number', "Fall");}

  //SETUP THE GRAPH SERIES, AXES, CONTROLS/////////////////////////////////////////////////////////////////////////////
  $( "#graphyear .btn-group" ).html("");
  fmt = (mm.vt=="p") ? '#.#%' : 'short';
  oAxes[Object.keys(oAxes).length] = {title: '', format: fmt, minValue: 0};
  var YY = {};
  mm.vs.sort(function(a, b){	return (a.p + (a.y*100)) - (b.p + (b.y*100));});
  for (var i = 0; i < mm.vs.length; i++ ) {
    if (YY[mm.vs[i].y]==null) {
      YY[mm.vs[i].y] = "1";
      if (mm.activeYears[mm.vs[i].y] != null) {
        intRows++;
        $( "#graphyear .btn-group" ).append('<label class="btn btn-default active" onclick="o.yearselect(this, null);" title="Hide this year on the chart below"><input type="checkbox" autocomplete="off" checked>' + mm.vs[i].y + '</label>');
        oSeries[Object.keys(oSeries).length] = {targetAxisIndex: 0, color: arrColors[intRows]};
      } else {
        $( "#graphyear .btn-group" ).append('<label class="btn btn-default" onclick="o.yearselect(this, true);" title="Show this year on the chart below"><input type="checkbox" autocomplete="off">' + mm.vs[i].y + '</label>');
      }
    }
  }
  var j = 1;
  for (var i = (Object.keys(oSeries).length - 1); i >= 0; i--) {
    oSeries[i].color = arrColors[j];
    j++;
  }
  if (mm.ht=='True') {intRows++;oSeries[Object.keys(oSeries).length] = {type: "line", targetAxisIndex:intRows, color: 'SaddleBrown', pointShape: 'circle', pointSize: 5};oAxes[Object.keys(oAxes).length] = { gridlines : {count: 0 }};}


  //GET THE DATA ROWS FOR THE TABLE
  o.setDataRows(mm);
  o.setChartRows(mm);
  for (var z = 0; z < o.datarows.length; z++) {
    dtChart.addColumn( 'number', o.datarows[z][0] );
  }
  dt.addRows(o.datarows);
  dtChart.addRows(o.chartrows);

  //CREATE THE CHART AND TABLE
  if (!this.chart) {this.chart = new google.visualization.ComboChart(document.getElementById("measurechart"))};
  if (!this.table) {this.table = new google.visualization.Table(document.getElementById("measuretable"));}
  var strYTD = (this.contexttype=="ytd") ? " (Year-To-Date) " : " ";
  var chartoptions = {animation: {duration: 1000, easing: 'linear' },seriesType: o.charttype, series: oSeries, height: 400,width: "100%",hAxis: { title: (mm.it=="m") ? "Month" : "Quarter" },vAxes:oAxes};
  var tableoptions = {title: mm.m, showRowNumber: false, width: '100%', height: '100%'};
  this.mTitle = mm.m.replace(/\n/g,' ');

  //DRAW THE CHART AND TABLE
  if (getType(mm)=="YEARLY" && o.contexttype!="seq") {
    this.chart.draw(dt, google.charts.Bar.convertOptions(chartoptions));
    this.table.draw(dtChart, tableoptions);
    this.dt = dtChart;
  } else if (o.contexttype=="seq") {
    this.chart.draw(dt, google.charts.Bar.convertOptions(chartoptions));
    this.table.draw(dt, tableoptions);
    this.dt = dt;
  } else {
    this.chart.draw(dtChart, google.charts.Bar.convertOptions(chartoptions));
    this.table.draw(dt, tableoptions);
    this.dt = dt;
  }
  $( "" ).html("<img src='" + this.chart.getImageURI() + "'/>");
};
App.prototype.yearselect = function(o, v) {
  var m = this.measures[$(".aindicator.active").attr("id")];
  var y = $(o).html().substring($(o).html().length - 4, $(o).html().length);
  m.activeYears[y] = v;
  this.createGraph(m);
};
App.prototype.selectYTD = function() {
  var m = this.measures[$(".aindicator.active").attr("id")];

  if ($('#showytdvalues').bootstrapSwitch('state')) {
    $('#groupbyperiod').bootstrapSwitch('state', true);
  }
  if ($('#showytdvalues').bootstrapSwitch('state')) {
    this.changecontexttype('ytd');
  } else {
    this.changecontexttype('val');
  }
};
App.prototype.dataTableToCSV = function () {

  var dt_cols = this.dt.getNumberOfColumns();
  var dt_rows = this.dt.getNumberOfRows();
  var csv_cols = [];
  var csv_out;

  for (var i=0; i<dt_cols; i++) {
    csv_cols.push(this.dt.getColumnLabel(i).replace(/,/g,""));
  }

  csv_out = csv_cols.join(",")+"\r\n";
  for (i=0; i<dt_rows; i++) {
    var raw_col = [];
    for (var j=0; j<dt_cols; j++) {
      raw_col.push(this.dt.getFormattedValue(i, j, 'label').replace(/,/g,""));
    }
    csv_out += raw_col.join(",")+"\r\n";
  }
  return csv_out;
};

App.prototype.dataTableLiveToCSV = function (dataTable) {
  //  alert(dataTable.toString);
    var dt_cols = dataTable.getNumberOfColumns();
    var dt_rows = dataTable.getNumberOfRows();
    var csv_cols = [];
    var csv_out;
  
    for (var i=0; i<dt_cols; i++) {
      csv_cols.push(dataTable.getColumnLabel(i).replace(/,/g,""));
    }
  
    csv_out = csv_cols.join(",")+"\r\n";
    for (i=0; i<dt_rows; i++) {
      var raw_col = [];
      for (var j=0; j<dt_cols; j++) {
        raw_col.push(dataTable.getFormattedValue(i, j, 'label').replace(/,/g,""));
      }
      csv_out += raw_col.join(",")+"\r\n";
    }
    return csv_out;
  };





App.prototype.downloadCSV = function() {
  var csv_out = this.dataTableToCSV();

  var browser = navigator.userAgent;
  var IEversion = 99;
  if (browser.indexOf("MSIE") > 1) {IEversion = parseInt(browser.substr(browser.indexOf("MSIE")+5, 5));}
  if (IEversion < 10) {

  } else {
    var blob = new Blob([csv_out], {type: 'text/csv;charset=utf-8'});
    var url  = window.URL || window.webkitURL;
    var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    link.href = url.createObjectURL(blob);
    link.download = this.mTitle + ".csv";
    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, false);
    link.dispatchEvent(event);
  }
};

App.prototype.downloadLiveCSV = function(dataTable) {
  //var csv_out = this.dataTableToCSV();
  var csv_out = this.dataTableLiveToCSV(dataTable);
  var browser = navigator.userAgent;
  var IEversion = 99;
  if (browser.indexOf("MSIE") > 1) {IEversion = parseInt(browser.substr(browser.indexOf("MSIE")+5, 5));}
  if (IEversion < 10) {

  } else {
    var blob = new Blob([csv_out], {type: 'text/csv;charset=utf-8'});
    var url  = window.URL || window.webkitURL;
    var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    link.href = url.createObjectURL(blob);
    link.download = this.mTitle + ".csv";
    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, false);
    link.dispatchEvent(event);
  }
};


App.prototype.selectGroupByPeriod = function() {

  if (!$('#groupbyperiod').bootstrapSwitch('state')) {
    $('#showytdvalues').bootstrapSwitch('state', false);
  }
  if (!$('#groupbyperiod').bootstrapSwitch('state')) {
    this.changecontexttype('seq');
  } else {
    this.changecontexttype('val');
  }
};
App.prototype.changecontexttype = function(sContext) {
  this.contexttype = sContext;
  var m = this.measures[$(".aindicator.active").attr("id")];
  this.createGraph(m);
};
App.prototype.changegraphtype = function(sType) {
  var m = this.measures[$(".aindicator.active").attr("id")];
  this.charttype = sType;
  this.createGraph(m);
};
App.prototype.failGET = function() {
  alert( "Error" );
};
App.prototype.drawSymbol = function(sPOSNEG, sDIRECTION) {
  var sReturn = (sPOSNEG=="N/A") ? "" : (sDIRECTION == "Up") ? '<span class="glyphicon glyphicon-arrow-up ' + sPOSNEG + '"></span>' : (sDIRECTION == "Down") ? '<span class="glyphicon glyphicon-arrow-down ' + sPOSNEG + '"></span>' : '<span class="glyphicon glyphicon-minus ' + sPOSNEG + '"></span>';
  return sReturn;
};
App.prototype.drawMeasure = function(m, cat) {
  var o = this;
  var sKEYWORDS, sMEASURE, sVALUE, sINTERVAL, sPOSNEG, sPERIOD, sDIRECTION, sCHANGE, sID, lastVal, lastYear, lastPeriod, intDA;
  var compVal1, compVal2;
  sMEASURE = m.m;
  sKEYWORDS = m.kw;

  intDA = (m.da=="") ? 0 : parseInt(m.da);

  //CREATE YTD VALUES FOR NUMERIC AND CURRENCY MEASURES
  m.ytds = {};
  lastVal = 0
  if (m.ytd=="True") {
    m.vs.sort(function(a, b){	return (a.p + (a.y*100)) - (b.p + (b.y*100));});

    $.each( m.vs, function(j,vitem) {
      if (m.ytds[vitem.y]==null) { m.ytds[vitem.y] = {}; m.ytds[vitem.y].value = 0;lastVal = 0; }
      if (m.ytds[vitem.y][vitem.p]==null) { m.ytds[vitem.y][vitem.p] = {}; m.ytds[vitem.y][vitem.p] = 0; }
      m.ytds[vitem.y].value += vitem.v;
      m.ytds[vitem.y][vitem.p] += vitem.v + lastVal;
      lastVal = m.ytds[vitem.y][vitem.p];
      lastYear = vitem.y;
      lastPeriod = vitem.p;
    });

    m.vs.sort(function(a, b){	return (b.p + (b.y*100)) - (a.p + (a.y*100));});
    m.ytds.curYear = lastYear;
    m.ytds.curPeriod = lastPeriod;
    compVal1 = m.ytds[lastYear][lastPeriod];
    compVal2 = m.ytds[lastYear - 1][lastPeriod];
    sVALUE = (m.vt=="n") ? numberWithCommasAbbr(compVal1, intDA) : "$" + numberWithCommasAbbr(compVal1, intDA);
    if (m.it=="m") {
      sPERIOD = m.vs[0].y + " " + arrMM[m.vs[0].p] + " Year-To-Date Result";
    } else {
      sPERIOD = m.vs[0].y + " Q" + m.vs[0].p + " Year-To-Date Result";
    }
    sINTERVAL = "year";
  } else {
    m.vs.sort(function(a, b){	return (b.p + (b.y*100)) - (a.p + (a.y*100));});
    compVal1 = m.vs[0].v;
    compVal2 = (m.it=="m") ? m.vs[12].v : (m.it=="y") ? m.vs[1].v : m.vs[4].v;

    sVALUE = (m.vt=="n") ? numberWithCommasAbbr(compVal1, intDA) : (m.vt=="c") ? "$" + numberWithCommasAbbr(compVal1, intDA) : (m.vs[0].v * 100).toFixed(intDA) + "%";
    if (m.it=="m") {
      sPERIOD = m.vs[0].y + " " + arrMM[m.vs[0].p] + " Result";
      sINTERVAL = "year";
    }
    if (m.it=="q") {
      sPERIOD = m.vs[0].y + " Q" + m.vs[0].p + " Result";
      sINTERVAL = "year";
    }
    if (m.it=="y") {
      sPERIOD = m.vs[0].y + " Result";
      sINTERVAL = "year";
    }
    if (m.it=="s") {
      sPERIOD = m.vs[0].y + " " + arrSeason[m.vs[0].p] + " Result";
      sINTERVAL = "year";
    }

  }

  if (Math.abs(compVal1 - compVal2) <= Math.abs(compVal2 * (1+parseFloat(m.v)) - compVal2)) {
    sPOSNEG = "STABLE";
    sDIRECTION = "STABLE";
  } else {
    if ( compVal1 > compVal2) {
      sDIRECTION = "Up";
    } else {
      sDIRECTION = "Down";
    }

    if ( compVal1 > compVal2 && m.dd=="Up" ) {
      sPOSNEG = "POSITIVE";
    } else if (compVal1 < compVal2 && m.dd=="Down") {
      sPOSNEG = "POSITIVE";
    } else {
      sPOSNEG = "NEGATIVE";
    }
  }

  if (m.dd=="None") {sPOSNEG = "N/A";}
  sCHANGE = (compVal1/compVal2-1) * 100;
  sCHANGE = Math.abs(sCHANGE.toFixed(2)) + "%";
  sCHANGE = (m.vt=="p") ? ((compVal1 - compVal2) * 100).toFixed(2) + "%" : sCHANGE;
  sID = m.id;
 
  $( "#cat" + cat.replace(/\W+/g, '')).append( this.createMeasure(sPOSNEG, sKEYWORDS, sMEASURE, sVALUE, sPERIOD, sDIRECTION, sINTERVAL, sCHANGE, sID) );
};
App.prototype.createTab = function (sTabName, index){
  var o = this;
  if (index == 0) {
    $( o.selectors.tabs ).append( '<li class="active"><a href="#cat' + sTabName.replace(/\W+/g, '') + '" data-toggle="tab">' + sTabName + '<span class="sr-only">(current)</span></a></li>' );
    $( o.selectors.indicators ).append( '<section class="tab-pane active" id="cat' + sTabName.replace(/\W+/g, '') + '"></section>' );
  } else {
    $( o.selectors.tabs ).append( '<li><a href="#cat' + sTabName.replace(/\W+/g, '') + '" data-toggle="tab">' + sTabName + '</a></li>' );
    $( o.selectors.indicators ).append( '<section class="tab-pane" id="cat' + sTabName.replace(/\W+/g, '') + '"></section>' );
  }
};
App.prototype.createMeasure = function(strPSN, strKW, strTitle, strVal,strPeriod, strDirection, strInterval, strChangeVal, strID ) {
  var strHTML = "";
  strHTML += '<div class="aindicator nonactive" href="#" id="' + strID + '"><div class="indicator ' + strPSN + '">';
  strHTML += '<div class="hide keywords">' + strKW + '</div>';
  //strHTML += '<h3>' + strTitle.replace(/\n/g,'<br/>').replace(/\Percentage/g,'%').replace(/\Number/g,'#') + '</h3>';
  strHTML += '<h3>' + strTitle.replace(/\n/g,'<br/>') + '</h3>';
  strHTML += '<div class="measure">';
  strHTML += '<section class="measuredetail hide"></section>';
   /* hide measure detail section - replace with icon

  <img src="/resources/dashboard/img/line.png" alt="Line chart icon"/>*/
  strHTML += '<br><p class="measurevalue"><span>' + strVal + '</span></p>';
  strHTML += '<p class="measureperiod">' + strPeriod + '</p>';
  strHTML += '<div class="row">';
  strHTML += '<div class="col-xs-12 explanation"><div>';
//  strHTML += (strDirection == "Up") ? '<p><span class="glyphicon glyphicon-arrow-up"></span></p><p class="direction">Increase of ' + strChangeVal + ' from previous ' + strInterval + '</p>' : '';
 // strHTML += (strDirection == "Down") ? '<p><span class="glyphicon glyphicon-arrow-down"></span></p><p class="direction">Decrease of ' + strChangeVal + ' from previous ' + strInterval + '</p>' : '';
 // strHTML += (strDirection == "Stable") ? '<p><span class="glyphicon glyphicon-minus"></span></p><p class="direction">Stable from previous ' + strInterval + '</p>' : '';
  strHTML += '</div>';
  strHTML += '</div>';
  strHTML += '</div>';
  strHTML += '</div>';
  strHTML += '</div></div>';
 return strHTML;
};
App.prototype.search = function( q ) {
  o = this;
  q = q.toLowerCase();
  var strHTML = "", intCount = 0;
  $( "#dashboard_searchresults" ).html( "" );
  if ( q == "" ) {
    $( "#searcherror" ).removeClass( "hide" );
    return;
  } else {
    $( "#searcherror" ).addClass( "hide" );
    $.each( $("div.aindicator"), function(j,item) {
      $( "#dashboard_indicatortabs, #dashboard_nav" ).addClass( 'hide' );
      if ( $( item ).html().toLowerCase().indexOf(q) >= 0) {
        $( "#dashboard_searchresults" ).append( $( item ).clone() );
        intCount++;
      }
    });
    $( "#dashboard_searchresults" ).html( "<p class='searchTotal'>" + intCount + " Results Found</p>" + $( "#dashboard_searchresults" ).html());
    $( "#dashboard_searchresults, #searchreset" ).removeClass( 'hide' );
    $( "#dashboard_searchresults .aindicator.nonactive" ).click(function() {
      o.measureClick(this);
    });
  }
};
App.prototype.resetsearch = function( oSearch ) {
  $( "#dashboard_searchresults, #searchreset, #searcherror" ).addClass( 'hide' );
  $( "#dashboard_indicatortabs, #dashboard_nav" ).removeClass( 'hide' );
  $( oSearch ).val("");
};
App.prototype.generateExcel = function(strID) {
  var csv_cols = [], csv_out, m, sPeriod;
  csv_cols.push("Measure Name");
  csv_cols.push("Year");
  csv_cols.push("Period");
  csv_cols.push("Value");
  csv_out = csv_cols.join(",")+"\r\n";


  $.each( $(strID + " select"), function(i,item) {
    $.each(item, function(j, subitem) {
      if ($(subitem).is(':checked')) {
        m = dashboard.measures[$(subitem).val()];
        m.vs.sort(function(a, b){	return ( ((a.y * 1000) + a.p) - ((b.y *1000) + b.p));});
        $.each( m.vs, function (k, vsitem) {
          sPeriod = (m.it=="m") ? arrMM[vsitem.p] : (m.it=="q") ? "Q" + vsitem.p : (m.it=="s") ? arrSeason[vsitem.p] : "";

          csv_cols = [];
          csv_cols.push( m.m.replace(/\n/g,' ').replace(/,/g,"") );
          csv_cols.push( vsitem.y );
          csv_cols.push( sPeriod );
          csv_cols.push( vsitem.v );
          csv_out += csv_cols.join(",")+"\r\n";
        });
      }
    });
  });
  var browser = navigator.userAgent;
  var IEversion = 99;
  if (browser.indexOf("MSIE") > 1) {IEversion = parseInt(browser.substr(browser.indexOf("MSIE")+5, 5));}
  if (IEversion < 10) {
    alert("You are using an old version of Internet Explorer that does not allow for file export.  Please upgrade to a more up to date browser in order to use this feature.");
  } else {
    var blob = new Blob([csv_out], {type: 'text/csv;charset=utf-8'});
    var url  = window.URL || window.webkitURL;
    var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    link.href = url.createObjectURL(blob);
    link.download = "TorontoMeasureData.csv";
    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, false);
    link.dispatchEvent(event);
  }
};
/*
App.prototype.generatePDF = function(strID) {

  $( "#modalPDF .modal-footer button, #modalPDF .selectMeasures").addClass("hide");
  $( "#pdfprogress, #modalPDF .pleaseWait" ).removeClass("hide");
  var dt = new Date();
  var dd = {};
  dd.pageSize = 'LEGAL';
  dd.footer = function(currentPage, pageCount) { return {columns: [{text: 'www.toronto.ca/progress', style: 'footertext', margin: 15}, {text: currentPage.toString() + ' of ' + pageCount, alignment: 'right', style: 'footertext', margin: 15 }] } };
  dd.header = {columns: [ {image: 'logo', width: 80, margin: [0,20,0,10]}, {text: 'Toronto\'s Management Information Dashboard', margin: [0,20,20,10], style: 'headertext'} ] };
  dd.pageMargins = [20, 70, 20, 60];
  dd.styles = {};
  dd.styles.reporttitle = {fontSize: 28,bold: true, alignment: 'center', color: "#000000", margin: [0,70,0,20]};
  dd.styles.measuretitle = {fontSize: 16,bold: true, alignment: 'left', color: "#000000", margin: [0,0,0,10], pageBreak: 'before'};
  dd.styles.scorecardcattitle = {fontSize: 12, bold: true, alignment: 'left'};
  dd.styles.scorecard = {margin: [0,0,0,15]};
  dd.styles.trendtitle = {fontSize: 14,bold: true, alignment: 'left', color: "#555", margin: [0,0,0,5]};
  dd.styles.reportdate = {fontSize: 16, bold: true, alignment: 'center' };
  dd.styles.cmo = {fontSize: 20, bold: true, alignment: 'center' };
  dd.styles.headertext = {fontSize: 12, color: "#aaa", alignment: "right", width: '50%'};
  dd.styles.sctableheader = {fontSize: 8, color: "#000", alignment: "center", fillColor: '#eeeeee'};
  dd.styles.footertext = {color: "#aaa", fontSize: 12}
  dd.styles.trendanalysis = {fontSize: 10};
  dd.styles.tableheader = {fontSize: 10, bold: true, fillColor: '#eeeeee'};
  dd.styles.cityper = {fontSize: 10, alignment: 'left', margin: [0,5,0,0]};
  dd.styles.datasource = {fontSize: 10, alignment: 'left', margin: [0,10,0,10]};
  dd.styles.narrative = {fontSize: 10, alignment: 'left', margin: [0,10,0,0]};
  dd.styles.positive = {fillColor: '#dff0d8', fontSize: 8};
  dd.styles.negative = {fillColor: '#f2dede', fontSize: 8};
  dd.styles.stable = {fillColor: '#fcf8e3', fontSize: 8};
  dd.styles.graphtitle = {fontSize: 14,bold: true, alignment: 'left', color: "#555", margin: [0,20,0,0]};
  dd.styles.Monthly = {fontSize: 8};
  dd.styles.Quarterly = {fontSize: 8};
  dd.styles.Seasonal = {fontSize: 8};
  dd.styles.Yearly = {fontSize: 8};
  dd.styles.termsheader = {fontSize: 12, bold: true, margin: [50, 500, 50,0]};
  dd.styles.termstext = {fontSize: 8, margin: [50, 5, 0,0]};
  dd.styles['N/A'] = {fillColor: '#eee'};

  dd.images = {};
  dd.images.logo = 'data:image/png;base64,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';

  dd.content = [];
  dd.content.push({text: 'Toronto\'s Management Information Dashboard',style: 'reporttitle'});
  dd.content.push({text: 'City Manager\'s Office',style: 'cmo'});
  dd.content.push({text: arrMM[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear(),style: 'reportdate'});
  dd.content.push({text: 'Terms of Use Disclaimer', style: 'termsheader'});
  dd.content.push({text: 'The City provides this service to the public on an "as is", "as available", basis. The City does not make any express or implied warranties, representations or endorsements with respect to the information in this report.', style: 'termstext'});
  dd.content.push({text: 'Although the City makes reasonable efforts to keep the information available through this report up-to-date, errors can occur in recording some transactions, and delays can occur in reporting information, affecting the accuracy of the information.', style: 'termstext'});
  dd.content.push({text: 'The City is not responsible for, and will not be liable to you or anyone else, for any damages whatsoever, including any indirect, special, incidental or consequential damages, arising out of or in connection with your use of, or inability to use, the information in this report.', style: 'termstext'});
  dd.content.push([{text: 'Trend Analysis Overview',style: 'measuretitle', pageBreak: 'before'}]);

  //GET LIST OF IDS TO REPORT ON
  var arrIDS = [];
  $.each( $(strID + " select"), function(i,item) {$.each(item, function(j, subitem) {	if ($(subitem).is(':checked')) {arrIDS.push( $(subitem).val() )}})});

  //SORT THE IDS BY CATEGORY
  arrIDS.sort(function(a, b){
   return ( ((dashboard.measures[a].c[0].charCodeAt(0)+dashboard.measures[a].c[0].charCodeAt(1)) * 10000 + (Math.round(dashboard.measures[a].id *1000)) ) -
    ((dashboard.measures[b].c[0].charCodeAt(0)+dashboard.measures[b].c[0].charCodeAt(1)) * 10000 + (Math.round(dashboard.measures[b].id *1000)) ) );
  });

  //GENERATE A PAGE PER MEASURE
  reportMeasure( dd, arrIDS, 0, 1, 0, "", 0 );

};
*/
App.prototype.getAnalysisTable = function(dd, m, scIndex) {
  var o = this, arrSC = [], aRow, strUpDown;
  arrSC[0] = {text: m.m.replace(/\n/g,' '), alignment: 'left', fontSize: 8};
  for (var i = 1; i <=5; i++) {arrSC[i] = {text: 'N/A', style: 'none', alignment: 'center', fillColor: '#eee', fontSize: 8};}

  var ret = {}
  ret.style = 'trendanalysis';
  ret.table = {};
  ret.table.widths = [200, '*', 108, 57, 57];
  ret.table.headerRows = 1;
  ret.table.body = [];
  ret.table.body[0] = [];
  ret.table.body[0].push({text: 'Trend', style: 'tableheader'});
  ret.table.body[0].push({text: 'Current Value', style: 'tableheader'});
  ret.table.body[0].push({text: 'Comparison Value', style: 'tableheader'});
  ret.table.body[0].push({text: '% Changed', style: 'tableheader'});
  ret.table.body[0].push({text: 'Analysis', style: 'tableheader'});

  var compVal1, compVal2;
  m.vs.sort(function(a, b){	return ( ((b.y * 1000) + b.p) - ((a.y *1000) + a.p));});
  if (m.ytd=="True") {
    compVal1 = m.ytds[m.ytds.curYear][m.ytds.curPeriod]; compVal2 = m.ytds[m.ytds.curYear - 1][m.ytds.curPeriod];
    aRow = o.getTrendRow(m, compVal1, compVal2, "Current Year-To-Date vs. Previous Year", false, true, false, false);
    ret.table.body.push(aRow);
    strUpDown = ((aRow[4].text=="Positive" && m.dd=="Up") || (aRow[4].text=="Negative" && m.dd=="Down")) ? "Increase" : ((aRow[4].text=="Positive" && m.dd=="Down") || (aRow[4].text=="Negative" && m.dd=="Up")) ? "Decrease" : aRow[4].text;
    arrSC[4] = {text: strUpDown, style: aRow[4].style, alignment: 'center', fontSize: 8};

    if (m.ht=="True") {
      compVal1 = m.ytds[m.vs[0].y][m.vs[0].p]; compVal2 = 0;
      $.each (this.targets[m.id], function(i,item) {if (item.y == m.vs[0].y && item.p <= m.vs[0].p) {compVal2 += item.v;}});
      if (compVal2 != 0) {
        aRow = o.getTrendRow(m, compVal1, compVal2, "Current Year-To-Date vs. Budget/Target", true, true, false, false)
        ret.table.body.push(aRow);
        strUpDown = ((aRow[4].text=="Positive" && m.dd=="Up") || (aRow[4].text=="Negative" && m.dd=="Down")) ? "Increase" : ((aRow[4].text=="Positive" && m.dd=="Down") || (aRow[4].text=="Negative" && m.dd=="Up")) ? "Decrease" : aRow[4].text;
        arrSC[5] = {text: strUpDown, style: aRow[4].style, alignment: 'center', fontSize: 8};
      }
    }
  }
  if (m.it!="y") {
    compVal1 = m.vs[0].v; compVal2 = (m.it=="m") ? m.vs[12].v : m.vs[4].v;
    aRow = o.getTrendRow(m, compVal1, compVal2, "Current Period vs. Last Year At This Time", false, false, true, false);
    ret.table.body.push(aRow);
    strUpDown = ((aRow[4].text=="Positive" && m.dd=="Up") || (aRow[4].text=="Negative" && m.dd=="Down")) ? "Increase" : ((aRow[4].text=="Positive" && m.dd=="Down") || (aRow[4].text=="Negative" && m.dd=="Up")) ? "Decrease" : aRow[4].text;
    arrSC[2] = {text: strUpDown, style: aRow[4].style, alignment: 'center', fontSize: 8};
  }

  compVal1 = m.vs[0].v; compVal2 = m.vs[1].v;
  aRow = o.getTrendRow(m, compVal1, compVal2, "Current Period vs. Last Period", false, false, false, true);
  ret.table.body.push(aRow);
  strUpDown = ((aRow[4].text=="Positive" && m.dd=="Up") || (aRow[4].text=="Negative" && m.dd=="Down")) ? "Increase" : ((aRow[4].text=="Positive" && m.dd=="Down") || (aRow[4].text=="Negative" && m.dd=="Up")) ? "Decrease" : aRow[4].text;
  arrSC[1] = {text: strUpDown, style: aRow[4].style, alignment: 'center', fontSize: 8};

  if (m.ht=="True") {
    compVal1 = m.vs[0].v; compVal2 = "";
    $.each (this.targets[m.id], function(i,item) {if (item.y == m.vs[0].y && item.p == m.vs[0].p) {compVal2 = item.v;}});
    if (compVal2 != "") {
      aRow = o.getTrendRow(m, compVal1, compVal2, "Current Period vs. Budget/Target", true, false, false, true);
      ret.table.body.push( aRow );
      strUpDown = ((aRow[4].text=="Positive" && m.dd=="Up") || (aRow[4].text=="Negative" && m.dd=="Down")) ? "Increase" : ((aRow[4].text=="Positive" && m.dd=="Down") || (aRow[4].text=="Negative" && m.dd=="Up")) ? "Decrease" : aRow[4].text;
      arrSC[3] = {text: strUpDown, style: aRow[4].style, alignment: 'center', fontSize: 8};
    }
  }

  dd.content.push(ret);
  dd.content[7][scIndex].table.body.push( arrSC );
};
App.prototype.getTrendRow = function(m, compVal1, compVal2, strTitle, blnTarget, blnYTD, blnYear, blnPeriod) {
  var ret = [];

  var sPOSNEG, sDIRECTION, sCHANGE, sCURPER, sLASTPER, sCURVAL, sLASTVAL, intDA;

  intDA = (m.da=="") ? 0 : parseInt(m.da);

  if (Math.abs(compVal1 - compVal2) <= Math.abs(compVal2 * (1+parseFloat(m.v)) - compVal2)) {
    sPOSNEG = "stable";
    sDIRECTION = "STABLE";
  } else {
    if ( compVal1 > compVal2) {sDIRECTION = "Up";} else {sDIRECTION = "Down";}
    if ( compVal1 > compVal2 && m.dd=="Up" ) {sPOSNEG = "positive";} else if (compVal1 < compVal2 && m.dd=="Down") {sPOSNEG = "positive";} else {sPOSNEG = "negative";}
  }
  sCHANGE = (compVal1/compVal2-1) * 100;
  sCHANGE = sCHANGE.toFixed(2) + "%";
  sCHANGE = (m.vt=="p") ? ((compVal1 - compVal2) * 100).toFixed(2) + "%" : sCHANGE;
  //sCHANGE = Math.abs(sCHANGE.toFixed(2)) + "%";
  //sCHANGE = (m.vt=="p") ? Math.abs((compVal1 - compVal2) * 100).toFixed(2) + "%" : sCHANGE;
  if (m.dd=="None") {sPOSNEG = "N/A";}

  if (blnYTD) {
    sCURPER = m.ytds.curYear + " ";
    sCURPER += (m.it=="m") ? arrMMM[m.ytds.curPeriod] : (m.it=="q") ? "Q" + m.ytds.curPeriod : (m.it=="s") ? arrSeason[m.ytds.curPeriod] : "";
    sCURPER += (blnYTD) ? " YTD" : "";
  } else {
    sCURPER = m.vs[0].y + " ";
    sCURPER += (m.it=="m") ? arrMMM[m.vs[0].p] : (m.it=="q") ? "Q" + m.vs[0].p : (m.it=="s") ? arrSeason[m.vs[0].p] : "";
  }

  if (blnTarget) {
    sLASTPER = "Budget/Target";
  } else {
    sLASTPER = (blnYear || blnYTD) ? "Previous Year" : (blnPeriod && m.it=="m") ? "Previous Month" : (blnPeriod && m.it=="q") ? "Previous Quarter" : (blnPeriod && m.it=="s") ? "Previous Season" : "Previous Year";
  }

  sCURVAL = (m.vt=="n") ? numberWithCommasAbbr(compVal1, intDA) : (m.vt=="c") ? "$" + numberWithCommasAbbr(compVal1, intDA) : (compVal1 * 100).toFixed(intDA) + "%";
  sLASTVAL = (m.vt=="n") ? numberWithCommasAbbr(compVal2, intDA) : (m.vt=="c") ? "$" + numberWithCommasAbbr(compVal2, intDA) : (compVal2 * 100).toFixed(intDA) + "%";

  var strUpDown = ((sPOSNEG=="positive" && m.dd=="Up") || (sPOSNEG=="negative" && m.dd=="Down")) ? "Increase" : ((sPOSNEG=="positive" && m.dd=="Down") || (sPOSNEG=="negative" && m.dd=="Up")) ? "Decrease" : properCase(sPOSNEG);

  ret.push({text: strTitle, style: sPOSNEG});
  ret.push({text: sCURPER + ": " + sCURVAL, style: sPOSNEG});
  ret.push({text: sLASTPER + ": " + sLASTVAL, style: sPOSNEG});
  ret.push({text: sCHANGE, style: sPOSNEG});
  ret.push({text: strUpDown, style: sPOSNEG});

  return ret;
};
App.prototype.getPeriodChart = function(mm, strPer, strType, w) {
  //var arrColors = ["#8B4513", "#FFAD5B", "#D8D8D8", "#82C1FF"]; 191970
  var arrColors = ["#8B4513", "#FFA500", "#808080", "#191970"];
  if (mm.it=="y") {arrColors = ["#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF", "#82C1FF"];}
  var o = this;
  o.contexttype = strType;
  o.charttype = "bars";
  var arrRows = [];
  var oSeries = {}, oAxes = {}, intRows=0;
  var dt = new google.visualization.DataTable();
  var dtChart = new google.visualization.DataTable();
  var fmt;

  mm.activeYears = {};
  var intLoop = (getType(mm)=="YEARLY") ? 15 : 3;
  for (var x = 0; x < intLoop; x++) {
    mm.activeYears[new Date().getFullYear() - x] = true;
  }

  //BUILD DATA TABLE STRUCTURE
  dt.addColumn( 'string', 'Year' );
  dtChart.addColumn( 'string', 'Period' );
  if (getType(mm)=="MONTHLY" && this.contexttype != "seq") {for (var x = 1; x <= 12; x++) {dt.addColumn('number', arrMM[x]);}}
  if (getType(mm)=="QUARTERLY" && this.contexttype != "seq") {for (var x = 1; x <= 4; x++) {dt.addColumn('number', "Q" + x);}}
  if (getType(mm)=="YEARLY" || o.contexttype=="seq") {dt.addColumn('number', mm.m.replace(/\n/g,' '));}
  if (getType(mm)=="SEASONAL" && this.contexttype != "seq") {dt.addColumn('number', "Winter");dt.addColumn('number', "Spring");dt.addColumn('number', "Summer");dt.addColumn('number', "Fall");}

  //SETUP THE GRAPH SERIES, AXES, CONTROLS/////////////////////////////////////////////////////////////////////////////
  $( "#graphyear .btn-group" ).html("");
  fmt = (mm.vt=="p") ? '#.#%' : 'short';
  oAxes[Object.keys(oAxes).length] = {title: '', format: fmt, minValue: 0};
  var YY = {};
  mm.vs.sort(function(a, b){	return (a.p + (a.y*100)) - (b.p + (b.y*100));});
  for (var i = 0; i < mm.vs.length; i++ ) {
    if (YY[mm.vs[i].y]==null) {
      YY[mm.vs[i].y] = "1";
      if (mm.activeYears[mm.vs[i].y] != null) {
        intRows++;
        oSeries[Object.keys(oSeries).length] = {targetAxisIndex: 0, color: arrColors[intRows]};
      }
    }
  }
  var j = 1;
  for (var i = (Object.keys(oSeries).length - 1); i >= 0; i--) {
    oSeries[i].color = arrColors[j];
    j++;
  }
  if (mm.ht=='True') {
    intRows++;
    oSeries[Object.keys(oSeries).length] = {type: "line", targetAxisIndex:0, color: '#8B4513', pointShape: 'circle', pointSize: 5};
    oAxes[Object.keys(oAxes).length] = { gridlines : {count: 0 }, format: fmt, minValue: 0};
  }

  //GET THE DATA ROWS FOR THE TABLE
  o.setDataRows(mm);
  o.setChartRows(mm);
  for (var z = 0; z < o.datarows.length; z++) {
    dtChart.addColumn( 'number', o.datarows[z][0] );
  }
  dt.addRows(o.datarows);
  dtChart.addRows(o.chartrows);

 // for (var i = 0; i < dt.getNumberOfRows(); i++) {
 //   if (i != 3 || dt.getNumberOfRows()!=4) {dt.setValue(i,0, dt.getFormattedValue(i, 0, 'label').substring(0,4) );}
 // }

 // if (dtChart.getNumberOfRows()==12) {
 //   for ( var i = 0; i < 12; i++ ) {
 //     dtChart.setValue(i, 0, dtChart.getFormattedValue(i, 0, 'label').substring(0,1));
 //   }
 // }

  //CREATE THE CHART AND TABLE
  if (!this.chart && o.contexttype!="data") {this.chart = new google.visualization.ComboChart(document.getElementById("rptchart"))};
  var chartoptions = {animation: {duration: 1000, easing: 'linear' }, seriesType: o.charttype, series: oSeries, height: 130,width: w,vAxes:oAxes, legend: {position: 'none'}};

  //DRAW THE CHART AND TABLE
  var ret = [];
  if (o.contexttype=="ytd") {
    this.chart.draw(dtChart, google.charts.Bar.convertOptions(chartoptions));
    ret.push({text: "Year-to-Date Results", style: "graphtitle", width: w});
    ret.push({image: this.chart.getImageURI(), width: w, height: 130, alignment: 'justified'});
  } else {
    this.chart.draw(dtChart, google.charts.Bar.convertOptions(chartoptions));
    ret.push({text: strPer + " Results", style: "graphtitle", width: w});
    ret.push({image: this.chart.getImageURI(), width: w, height: 130, alignment: 'justified'});
  }
  this.dt = dt;
  var tbl = {};
  tbl.table = {};
  tbl.table.headerRows = 1;
  tbl.table.widths = [];
  tbl.table.body = [];
  tbl.table.body[0] = [];

  var dt_cols = this.dt.getNumberOfColumns();
  var dt_rows = this.dt.getNumberOfRows();
  for ( var i = 0; i < dt_cols; i++ ) {
    tbl.table.body[0].push({text: this.dt.getColumnLabel(i).replace(/,/g,""), style: 'tableheader'});
    tbl.table.widths.push('*');
  }

  for (i = 0; i < dt_rows; i++) {
    tbl.table.body[i+1] = [];
    for (var j=1; j<dt_cols; j++) {
      if (j==0 && mm.it!="y") {
        tbl.table.body[i+1].push( {text: this.dt.getFormattedValue(i, j, 'label'), bold: true, color: "#ffffff", style: strPer, fillColor: arrColors[3-i]} );
      } else {
        tbl.table.body[i+1].push( {text: this.dt.getFormattedValue(i, j, 'label'), style: strPer} );
      }
    }
  }
  ret.push(tbl);
  if (o.contexttype=="val") {
    ret.push({text: mm.ds, alignment: 'center', style: 'datasource', width: w});
    if (o.narratives[mm.id] != null) {
      var arrHTML = $.parseHTML( dashboard.narratives[mm.id] );
      $.each(arrHTML, function(i, item) {
        ret.push({text: $(arrHTML[i]).text(), alignment: 'center', style: 'narrative'});
      });
    }
  }
  return ret;
};
App.prototype.openPDFCreator = function() {
  $.getJSON("/app_content/progress-portal-latest-mgmtinforpt-pdf/", function (data) {
      window.location.href = data.url;
  });
};
App.prototype.openEXCELCreator = function() {
  var arrIDs = [];
  if (!$("#dashboard_searchresults").hasClass("hide")) {$.each($("#dashboard_searchresults .aindicator"), function(i, item) {arrIDs.push(item.id);});}
  if ($(".aindicator.active").length> 0) {arrIDs.push($(".aindicator.active")[0].id)}
  $('#excelcat').multiselect('deselectAll', true);
  $('#excelcat').multiselect('select', arrIDs);
  $('#excelcat').multiselect('updateButtonText');

  var browser = navigator.userAgent;
  var IEversion = 99;
  if (browser.indexOf("MSIE") > 1) {IEversion = parseInt(browser.substr(browser.indexOf("MSIE")+5, 5));}
  var is_touch_device = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
  if (IEversion < 10 || is_touch_device) {
    window.location.href = '/City Of Toronto/City Managers Office/Toronto Progress Portal/Files/TorontoMeasureData.xls';
  } else {
    $('#modalExcel').modal();
  }
};
function reportIndex( dd, arrIDS ) {
  dd.content.push({text: 'Trend Analysis Overview',style: 'measuretitle', pageBreak: 'before'});
  var tbl = {}
  tbl.style = 'scorecard';
  tbl.table = {};
  tbl.table.widths = [200, '*', '*', '*', '*', '*'];
  tbl.table.headerRows = 1;
  tbl.table.body = [];
  tbl.table.body[0] = [];
  tbl.table.body[0].push({text: 'Measure Name', style: 'tableheader'});
  tbl.table.body[0].push({text: 'Current Period\nvs.\nLast Period', style: 'tableheader'});
  tbl.table.body[0].push({text: 'Current Period\nvs.\nLast Year at This Time', style: 'tableheader'});
  tbl.table.body[0].push({text: 'Current Period\nvs.\nBudget/Target', style: 'tableheader'});
  tbl.table.body[0].push({text: 'Current YTD\nvs.\nPrevious Year', style: 'tableheader'});
  tbl.table.body[0].push({text: 'Current YTD\nvs.\nBudget/Target', style: 'tableheader'});
  dd.content.push( tbl );
};
/*
function reportMeasure (dd, arrIDS, measure, section, progress, lastCat, scIndex) {
  var m = dashboard.measures[ arrIDS[measure] ];

  if (m.c[0] != lastCat) {
    //UPDATE SCORECARD WITH NEW CATEGORY TITLE AND TABLE
    dd.content[7].push({text: m.c[0],style: 'scorecardcattitle'});
    scIndex += 1;
    var tbl = {}
    tbl.style = 'scorecard';
    tbl.table = {};
    tbl.table.widths = [200, '*', '*', '*', '*', '*'];
    tbl.table.headerRows = 1;
    tbl.table.body = [];
    tbl.table.body[0] = [];
    tbl.table.body[0].push({text: 'Measure Name', style: 'sctableheader', alignment: 'left'});
    tbl.table.body[0].push({text: 'Current Period\nvs.\nLast Period', style: 'sctableheader'});
    tbl.table.body[0].push({text: 'Current Period\nvs.\nLast Year at This Time', style: 'sctableheader'});
    tbl.table.body[0].push({text: 'Current Period\nvs.\nBudget/Target', style: 'sctableheader'});
    tbl.table.body[0].push({text: 'Current YTD\nvs.\nPrevious Year', style: 'sctableheader'});
    tbl.table.body[0].push({text: 'Current YTD\nvs.\nBudget/Target', style: 'sctableheader'});
    dd.content[7].push( tbl );
    scIndex += 1;
    lastCat = m.c[0];
  }

  var strPer = (m.it=="m") ? "Monthly" : (m.it=="q") ? "Quarterly" : (m.it=="s") ? "Seasonal" : "Yearly";
  switch( section ) {
    case 1 :
      //MEASURE TITLE & TREND ANALYSIS TITLE
      dd.content.push({text: m.m.replace(/\n/g,' '),style: 'measuretitle', pageBreak: 'before'});
      dd.content.push({text: 'Trend Analysis',style: 'trendtitle'});
      dashboard.getAnalysisTable(dd, m, scIndex);
      dd.content.push({text: m.cp, style: 'cityper'});
      reportMeasure (dd, arrIDS, measure, section + 1, progress, lastCat, scIndex);
      break;
    case 2 :
      //GRAPHS
      if (m.ytd == "True") {
        dd.content.push( dashboard.getPeriodChart(m, strPer, "ytd", 610) );
        dd.content.push( dashboard.getPeriodChart(m, strPer, "val", 610) );
      } else {
        dd.content.push( dashboard.getPeriodChart(m, strPer, "val", 610) );
      }
      reportMeasure ( dd, arrIDS, measure, section + 1, progress, lastCat, scIndex );
      break;
    case 3 :
      if (measure < arrIDS.length - 1) {
        //END OF MEASURE
        setTimeout(function() {
          reportMeasure (dd, arrIDS, measure + 1, 1, progress, lastCat, scIndex);
        }, 50);
      } else {
        //END OF REPORT
        pdfMake.createPdf(dd).download('MgmtInfoRpt.pdf');
      }
      break;
  }
  if (section == 3) {
    progress = parseFloat($( "#pdfprogress .progress-bar" ).attr( "aria-valuenow")) + Math.floor((100/arrIDS.length) * 100)/100;
    if (progress > 100 || measure == arrIDS.length - 1) { progress = 100}
    $( "#pdfprogress .progress-bar" ).attr( "aria-valuenow", progress );
    $( "#pdfprogress .progress-bar" ).css( "width", progress + "%");
    if (progress==100) {
      setTimeout(function() {
        $( "#modalPDF .modal-footer button, #modalPDF .selectMeasures").removeClass("hide");
        $( "#pdfprogress, #modalPDF .pleaseWait" ).addClass("hide");
        $('#modalPDF').modal('toggle');
        $( "#pdfprogress .progress-bar" ).attr( "aria-valuenow", 0 );
        $( "#pdfprogress .progress-bar" ).css( "width", "0%");
        delete dashboard.chart;
      }, arrIDS.length*50);
    }
  }
};
*/
function getImageFromUrl(url, callback) {
  var img = new Image, data, ret={data: null, pending: true};

  img.onError = function() {
    throw new Error('Cannot load image: "'+url+'"');
  }
  img.onload = function() {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    data = canvas.toDataURL('image/png');
    // Grab the image as a jpeg encoded in base64, but only the data
    //data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
    // Convert the data to binary form
    //data = atob(data)
    document.body.removeChild(canvas);

    //ret['data'] = data;
    //ret['pending'] = false;
    if (typeof callback === 'function') {
      callback(data);
    }
  }
  img.src = url;
  return ret;
};
function numberWithCommasAbbr(x, p) {
  if (x==null) {return "";}
  x = parseFloat(x);
  var factor = '';
  if (x > 1000000) {
    factor = "M";
    x = x/1000000;
    x = x.toFixed(2);
  } else {
    x = x.toFixed(p);
  }
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".") + factor;
};
function numberWithCommas(x, p) {
  if (x==null) {return "";}
  x = parseFloat(x).toFixed(p);
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};
function setConsistentHeightDASHBOARD(strParentSelector, strChildSelector) {
  var itemsParent = $(strParentSelector);
  var heights = [];
  var tallest;
  itemsParent.each (
    function () {
      var items = $(this).find(strChildSelector);
      if (items.length) {
        items.each( function () {$(this).css('height','auto'); });
        items.each( function () { heights.push($(this).height()); });
        tallest = Math.max.apply(null, heights);
        items.each( function () {$(this).css('height',tallest + 'px'); });
      }
    })
};
function transpose(a) {
  var w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;
  if(h === 0 || w === 0) { return []; }
  var i, j, t = [];
  for(i=0; i<h; i++) {
    t[i] = [];
    for(j=0; j<w; j++) {
      t[i][j] = a[j][i];
    }
  }
  return t;
};
function AddZero(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + "";
};
function getCurrentTime(){
  var now = new Date();
  var hour = now.getHours() - (now.getHours() >= 12 ? 12 : 0);
  return [[now.getFullYear(),AddZero(now.getMonth() + 1),AddZero(now.getDate())].join("/"), [AddZero(hour), AddZero(now.getMinutes()),AddZero(now.getSeconds())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
};
//****************************************  MAIN RUN **********************************************************************
$(document).ready(function() {
  $.ajaxSetup({ cache: false });
  var sJSONMeasures = '/*@echo JSON_MEASURES*/';
  var sJSONNarratives = '/*@echo JSON_NARRATIVES*/';
  var sJSON_SSHA_LiveData = '/*@echo JSON_SSHA_LiveData*/';
  var sJSON_SSHA_HistoricalDemandTrafficlightData='/*@echo JSON_SSHA_HistoricalDemandTrafficLightData*/';
  var sJSON_SSHA_NightlySummaryTrafficlightData='/*@echo JSON_SSHA_NightlySummaryTrafficLightData*/';
  var sHTMLSource = '/resources/dashboard/html/dashboard.html';
  dashboard = new App('#dashboard_container','#dashboard_categorytabs','#dashboard_indicatortabs','#dashboard_index',sHTMLSource, sJSONMeasures, sJSONNarratives,
  sJSON_SSHA_LiveData,
  sJSON_SSHA_HistoricalDemandTrafficlightData,
  sJSON_SSHA_NightlySummaryTrafficlightData
);
  window.dashboardapp = dashboard;
  dashboard.loadHTML();
  $( window ).resize(function() {
    setConsistentHeightDASHBOARD("#dashboard_indicators", ".indicator h3");
    setConsistentHeightDASHBOARD("#dashboard_indicators", ".explanation");
  });
  
  });
google.load('visualization', '1', {packages: ['corechart', 'bar', 'table']});