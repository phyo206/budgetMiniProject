// BUDGET CONTROLLER
var budgetController = (function(){
    var Expends = function(id,description,value){
		this.id = id;
		this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expends.prototype.calcPercentage=function(totalIncome){
        if(totalIncome >0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    }
    Expends.prototype.getPercentage =function(){
        return this.percentage;
    }
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
    };
    var data = {
		allItem : {
			exp : [],
			inc : []
		},
		totals : {
			exp : 0,
			inc : 0
        },
        budget : 0,
        percentage : -1
    }

    var calculateTotal=function(type){
        var sum=0;
        data.allItem[type].forEach(function(cur){
            sum+= cur.value;
        })
        data.totals[type]=sum;
       
    }
    return {
		addItem : function(type,desc,val){
			var newItem,ID;
			if(data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;	
            }else{
                ID = 0;
            }        
			if(type === 'exp'){
				newItem = new Expends(ID,desc,val);	
			}else if(type === 'inc'){
				newItem = new Income(ID,desc,val);	
			}
			data.allItem[type].push(newItem);
			return newItem;
        },
        deleteItem : function(type,id){
            var ids = data.allItem[type].map(function(current){
                return current.id;
            })
            var index=ids.indexOf(id);
            if(index !== -1){
                data.allItem[type].splice(index,1);
            }

        },
        calculateBudget : function(){
            //1.calculate totla income and total expense
                calculateTotal('exp');
                calculateTotal('inc');
            //2.calculate budget=income -expense
                 data.budget=data.totals.inc- data.totals.exp;
            //3.calculate the percentage of income we spent
            if(data.totals.inc > 0){
                data.percentage= Math.round((data.totals.exp / data.totals.inc) *100) ;
            }
            else{
                data.percentage = -1;
            }
        },
        getBudget:function(){
            return{
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        calculatePercentage:function(){
            data.allItem.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentage:function(){
            var allPer=data.allItem.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPer;
        },
        test : function(){
            return data.allItem;
        }
    }

})();

// UI CONTROLLER
var UIController = (function(){
    var DOMstrings = {
		inputType : '.add__type',
		inputDescription : '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensePerLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }
    var formatNumber =function(num ,type){
        var numSplit , int ,dec, type;
       //+ or - before number
       //2 decimal point
       //comma separating the thousands 
       num =Math.abs(num);
       num= num.toFixed(2);
       numSplit =num.split('.');
        int =numSplit[0];
        if(int.length > 3){
           int= int.substr(0,int.length-3) + ','+ int.substr(int.length-3,int.length);
        }
        dec=numSplit[1];
        return (type==='exp' ? '-' : '+') +'  '+ int +'.'+ dec;
    }

    return {
        getinput : function(){
            return {
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            }
        },
        getDOMStrings : function(){
            return DOMstrings;
        },
        addListItem : function(obj,type){
            var html;
            // 1.	Create HTML String with placeholder text
            var html,newHTML,element;
            if(type === 'inc'){
                element= DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }else if(type === 'exp'){
                element= DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }             
            // 2.	Replace Placeholder text with some actual data
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.description);
            newHTML = newHTML.replace('%value%',formatNumber(obj.value,type));

            // 3.	Insert The HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },
        deleteListItem : function(selectorId){
            var el= document.getElementById(selectorId);
           el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields,fieldArr;
           fields= document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);

            fieldArr= Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current,index,array){
                current.value='';
            });
            fieldArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget >0 ? type ='inc' : type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +'%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';
            }
        },
        displayPercentage : function(percentage){
           var fields= document.querySelectorAll(DOMstrings.expensePerLabel);

           var nodeListForEach=function(list , callback){
                for (i=0;i<list.length;i++){
                    callback(list[i],i);
                }
           }
           nodeListForEach(fields,function(current,index){
                //Do some stuff
                if(percentage[index] >0){
                    current.textContent=percentage[index]  +  '%';
                }else{
                    current.textContent='---';
                }
             })
        },
        displayMonth :function(){
            var now ,year,month;
           now= new Date();
           year =now.getFullYear();
           month=now.getMonth();
           months=["January","February","March","April","May","June","July","August","September","October","November","December"];
           document.querySelector(DOMstrings.dateLabel).textContent=months[month]+'  '+year;
        }
    }
})();

// APP CONTROLLER
 var controller = (function(budgetCtrl,UICtrl){
    var setupEventListener = function(){
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(event){
			if(event.keyCode === 13){
				ctrlAddItem();
			}
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    }
    var updatebuget=function(){
        //1.Calculate budget
        budgetCtrl.calculateBudget();
        //2.Return the budget
        var budget=budgetCtrl.getBudget();;
        console.log(budget);
        //3.Display the budget in the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentage =function(){
        //1.Calculate percentage
        budgetCtrl.calculatePercentage();
        //2. Read percentage from budget controller
       var percentage= budgetCtrl.getPercentage();
        //3.Update the UI with new percentage
        UICtrl.displayPercentage(percentage);
    }

    var ctrlAddItem = function(){
        // 1.	Get the file input data
       var input=UICtrl.getinput();
        if(input.description!=='' && !isNaN(input.value) && input.value >0){
            // 2.	Add the item to the budget controller
            var newItem;
            newItem=budgetCtrl.addItem(input.type,input.description,input.value);
            // 3.	Add the item to the UI
            UICtrl.addListItem(newItem,input.type);
            //4. Clear field
            UICtrl.clearFields();
            //5.Calculate and update budget
            updatebuget();
            //6.Calculate and update percentage
            updatePercentage();
        }
       }
       var ctrlDeleteItem=function (event){
           var itemId,splidId,type,Id;
           itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
           if(itemId){
            splidId=itemId.split('-');
            type = splidId[0];
            Id = parseInt(splidId[1]);

            //delete the item from the datastructure
            budgetCtrl.deleteItem(type,Id);
            //delete the item from UI
            UICtrl.deleteListItem(itemId);
            //update and show the new budget
            updatebuget(); 
            //.Calculate and update percentage
            updatePercentage();
           }
       }

    return {
		init : function(){
            UICtrl.displayBudget({
                budget: 0,
                totalInc :0,
                totalExp : 0,
                percentage :-1
            });
            UICtrl.displayMonth();
			console.log('Application Start');
			setupEventListener();
		}
	}

})(budgetController,UIController);
controller.init();




