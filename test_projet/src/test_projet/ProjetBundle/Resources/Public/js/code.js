var projet, workbench, title = null, inputTitle = null, cy, goalSet, tools, currentState, stackState = new Array ();
var l = {
    name: 'breadthfirst',
    fit: true, // whether to fit the viewport to the graph
    directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
    padding: 30, // padding on fit
    circle: false, // put depths in concentric circles if true, put depths top down if false
    spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    roots: undefined, // the roots of the trees
    maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    ready: undefined, // callback on layoutready
    stop: undefined 
};


var setGoalState = {
    begin : function () {
	$('#parentLayout').hide();	
	$('#indicateur').text("Nom de l'objectif");
	$('<button>')
	    .attr('id', 'ajouter')
	    .append($('<img>').attr('src', 'bundles/projet/img/valider.svg').css({
		witdh:'20px',
		height:'20px',
	    }))
	//.text('ajouter')
	    .on('click', addGoal)
	    .appendTo(tools);
    }, 
    end : function () {
	$('#ajouter').remove();
    },
};

var editGoalState = {
    goal : null,
    begin : function () {
	elt = this.goal.elt;
	goal = this.goal;
	console.log('state.goal : ' + goal.id)
	$('#nom').val(goal.name);
	$('#descriptif').val(goal.desc);
	$('#indicateur').text("Editer l'objectif");
	$('<button>')
	    .attr('id', 'modifier')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/valider.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	
	    //.text('modifier')
	    .on('click', function (event) {
		event.stopPropagation();
		console.log('modifier');
		var newName = $('#nom').val();
		if (newName) {
		    $('#' + goal.id + 'goalName').text(newName);
		    cy.$('#' + goal.id).data('label', newName);	
		}
		var desc = $('#descriptif').val();
		
		$('#' + goal.id + 'goalDesc').text(desc);
		cy.$('#' + goal.id).qtip('api').destroy(true);
		cy.$('#' + goal.id).qtip({
		    content: desc,
		    position: {
			my: 'top center',
			at: 'bottom center'
		    },
		    style: {
			classes: 'qtip-bootstrap',
			tip: {
			    width: 16,
			    height: 8
			}
		    },
		});
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'supprimer')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/delete.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	
	//    .text('supprimer')
	    .on('click', function (event) {
		event.stopPropagation();
		$('#'+goal.id).hide();
		function remove (id) {
		    $('#'+id+'Children').children().each(
			function () {
			    var nextId = $(this).attr('id');
			    remove(nextId);
			});
		    $('#'+id).remove();
		    cy.$('#'+id).remove();
		}
		remove(goal.id);
		nextState(setGoalState);
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'ajouterSousObjectif')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/add.svg',
	    }).css({
		    width: '20px',
		    height: '20px',
		}))
	    //.text('ajouter un sous objectif')
	    .on('click', function (event) {
		event.stopPropagation();
		var state = Object.create(ajouterSousObjectifState);
		state.parent = goal; 
		nextState(state);
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'precedent')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/back.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	
	    //.text('precedent')
	    .on('click', function (event) {
		event.stopPropagation();
		nextState();
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'gotoRoot')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/root.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	
	    //.text('root')
	    .on('click', function (event) {
		event.stopPropagation();
		nextState(setGoalState);
	    })
	    .appendTo(tools);
	$('#ajouter').remove();
    },
    end: function () {
	$('#modifier').remove();
	$('#supprimer').remove();
	$('#ajouterSousObjectif').remove();
	$('#precedent').remove();
	$('#gotoRoot').remove();
    },
};

var ajouterSousObjectifState = {
    parent: null,
    begin: function () {
	var parent = this.parent;
	$('#indicateur')
	    .hide()
	    .text('Ajouter un sous objectif à ' + parent.name)
	    .show();
	$('<button>')
	    .attr('id','ajouterSousObjectif')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/valider.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	    //.text('ajouter le sous objectif')
	    .on('click', function (event) {
		event.stopPropagation();
		addSubGoal(event,parent.id);
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'precedent')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/back.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	    //.text('precedent')
	    .on('click', function (event) {
		event.stopPropagation();
		nextState();
	    })
	    .appendTo(tools);
	$('<button>')
	    .attr('id', 'gotoRoot')
	    .append( $('<img>').attr({
		src: 'bundles/projet/img/root.svg',
	    }).css({
		width: '20px',
		height: '20px',
	    }))
	    //.text('root')
	    .on('click', function (event) {
		event.stopPropagation();
		nextState(setGoalState);
	    })
	    .appendTo(tools);
    },
    end: function () {
	$('#precedent').remove();
	$('#gotoRoot').remove();
	$('#ajouterSousObjectif').remove();
    },
    add: addSubGoal,
};

function addGoal (event, parentId) {
    event.stopPropagation();
    var name = $('#nom').val();
    if (name) {
	var desc = $('#descriptif').val();
	var li = $('<li>').attr('id', name);
	$('<span>').text(name).attr('id', name + 'goalName').appendTo(li);
	$('<span>').text(desc).attr('id', name + 'goalDesc').appendTo(li);
	$('<ul>').attr('id', name + 'Children').appendTo(li);
	li.on('click', function (event) {
	    event.stopPropagation();
	    var state = Object.create(editGoalState);
	    state.goal = {
		elt: this,
		id: name,
		name: name,
		desc: desc,
	    };
	    console.log('state.goal : ' + state.goal.id);
	    nextState(state);
	});
	if (parentId) {   
	    li.appendTo( $('#' + parentId +'Children') );
	} else {
	    li.appendTo( goalSet );
	}
	if (cy.$('#'+name).empty()) {
	    cy.add({data: { id: name, label: name }});
	    if (desc) {
		cy.$('#'+name).qtip({
		    content: desc,
		position: {
		    my: 'top center',
		    at: 'bottom center'
		},
		    style: {
			classes: 'qtip-bootstrap',
			tip: {
			    width: 16,
			    height: 8
			}
		    },
		});
	    }
	}
	cy.layout(l);
	return {
	    id: name,
	    name: name,
	    desc: desc,
	};
    } else {
	return null;
    }
}

function addSubGoal (event, parentId) {
    event.stopPropagation();
    var child = addGoal(event, parentId);
    if (child) {
	if (cy.$('#'+parentId).nonempty() ) {
	    cy.add({data: { id: parentId + '"' + child.name, weight: 1, source: child.name, target: parentId }});
	}
    }
}

function valideTitleByKeydown (event) {
    event.stopPropagation();
    if ( (event.key === "Enter") && inputTitle.val() ) {
	//nextState(setGoalState);
	nextState();
    }
}

function valideTitleByFocusout (event) {
    event.stopPropagation();
    if (inputTitle.val()) {
	//nextState(setGoalState);
	nextState();
    }
}

var setTitleState =  {
    begin : function () {
	workbench.hide();
	projet
	    .off('click')
	    .on('keydown', valideTitleByKeydown)
	    .on('focusout', valideTitleByFocusout);
	var labelText = "Nommer le projet";
	if (title) {
	    projet.animate({
		top :'20%',
	    }, 150);
	    labelText = "Renommer le projet";
	}
	
	
	projet.hide().empty();
	$('<label>')
	    .attr('for', 'setProjetName')
	    .text(labelText)
	    .appendTo(projet);
	
	inputTitle = $('<input>');
	inputTitle.attr({
	    id : 'setProjetName',
	    name: 'setProjetName',
	    type: 'text',
	    placeholder: 'nom du projet',
	    required:'true',
	})
	    .val(title)
	    .appendTo(projet);
	projet.show();	
    },
    end : function () {
	projet
	    .animate({
		top :'0px',
	    }, 150)
	    .hide().empty();
	title = inputTitle.val();
	$('<h1>').attr('id', 'projectName').text(title).appendTo(projet);
	projet
	    .off('keydown')
	    .off('focusout')
	    .on('click', function () {
	   // nextState(setTitleState);
		nextState(setTitleState);
	})
	    .show();
	workbench.show();
    },
};

function nextState( state ) {
    var lastState = currentState;
    if (state) {
	console.log('state');
	stackState.push(lastState);
	currentState = state;
    } else {
	console.log(stackState.length);
	if ( !(stackState.length > 1) ) {
	    stackState.push(setGoalState);
	    currentState = Object.create(setGoalState);
	} else {
	    console.log('no state and stack not empty');
	    currentState = stackState.pop();
	}
    }
    console.log(lastState);
    console.log(currentState);
    if (lastState) lastState.end();
    currentState.begin();
}
 
$(function () {
    projet = $('#projet');
    workbench = $('#workbench');
    goalSet = $('#goalSet');
    tools = $('#tools');
    nextState(setTitleState);
    cy = cytoscape({
	container: document.getElementById('cy'),
	boxSelectionEnabled: false,
	autounselectify: true,
	layout: l,
	
	ready: function(){
	    window.cy = this;
	},
	
	style: cytoscape.stylesheet().selector('node').css({
	    'content': 'data(label)',
	    'text-valign': 'center',
	    'text-outline-width': 1,
	    'text-outline-color': '#6699BB',
	    'background-color': '#6FB1FC',
	    'color': '#FCFCFC',
	    'width':100,
	    'height':100
	}).selector('edge').css({
	    'target-arrow-shape': 'triangle',
	    'width': 4,
	    'line-color': '#ddd',
	    'target-arrow-color': '#ddd'
	})
    });
}); // on dom ready
    
