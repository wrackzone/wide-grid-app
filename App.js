Ext.define('TSStringFilter',{
    extend: 'Rally.data.QueryFilter',
    config: {
        query_string: ''
    },
    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent([this.config]);
    },
    _createQueryString: function(property, operator, value) {
        this.filter = this.fromQueryString(this.query_string);
        return this.filter.toString();
    },
    /**
     * Converts a query string into a Rally compatible QueryFilter
     * @static
     * @param {String} query The query string to convert into a QueryFilter
     * @return {Rally.data.wsapi.Filter} A Rally.data.wsapi.Filter that will convert back to a query string if toString() is called
     */
    fromQueryString: function (query) {
        var parser = Ext.create('Rally.data.util.QueryStringParser', {
            string: query
        });

        var initial_expression = parser.parseExpression();
        return initial_expression;
    }
});

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    // items: ,
    launch: function() {
    	this.type_path = this.getSetting("type_path") || "HierarchicalRequirement";
    	this.query_string = this.getSetting("query_string");

    	this.filter = this.query_string ? 
    		Ext.create('TSStringFilter',{query_string:this.query_string}) :
    		null;

    	// console.log("filter",this.filter);

    	console.log( this.getSetting("type_path"));
    	console.log( this.getSetting("query_string"));
        
        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: [this.type_path], // ['portfolioitem/initiative'],
            filters: this.filter ? [this.filter] : [],
            autoLoad: true,
            enableHierarchy: true
        }).then({
            success: this._onStoreBuilt,
            scope: this
        });
    },
            
    _onStoreBuilt: function(store) {
        var modelNames = [this.type_path], //['portfolioitem/initiative'],
            context = this.getContext();

	    // if (this.filter) {
	    // 	console.log("filtering...",this.filter);
     //        store.filter(this.filter);
	    // }

        this.add({
            xtype: 'rallygridboard',
            context: context,
            modelNames: modelNames,
            toggleState: 'grid',
            stateful: false,
            plugins: [
                'rallygridboardaddnew',
                {
                    ptype: 'rallygridboardfieldpicker',
                    headerPosition: 'left',
                    modelNames: modelNames,
                    stateful: true,
                    stateId: context.getScopedStateId('columns-example')
                },
                {
                    ptype: 'rallygridboardinlinefiltercontrol',
                    inlineFilterButtonConfig: {
                        stateful: true,
                        stateId: context.getScopedStateId('filters'),
                        modelNames: modelNames,
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                defaultFields: [
                                    'ArtifactSearch',
                                    'Owner',
                                    'ModelType'
                                ]
                            }
                        }
                    }
                }
            ],
            gridConfig: {
                store: store,
                columnCfgs: [
                    'Name',
                    'State',
                    'Priority',
                    'Severity'
                ]
            },
            height: this.getHeight(),
            width:5000
        });
    },

    getSettingsFields : function() {
    	return [
    	{
            name: 'type_path',
            xtype:'rallycombobox',
            displayField: 'DisplayName',
            fieldLabel: 'Artifact Type',
            autoExpand: true,
            storeConfig: {
                model:'TypeDefinition',
                filters: [
                  {property:'Restorable',value:true}
                ]
            },
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10,
            valueField:'TypePath',
        },
		{
            xtype:'textareafield',
            grow: true,
            name:'query_string',
            labelAlign: 'top',
            width: 250,
            margin: 10,
            fieldLabel:'Limit to items that currently meet this query:'
        }
    	]
    }
});
