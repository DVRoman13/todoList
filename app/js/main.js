class TodoList {
    constructor(todoList) {
        this.selectStatus = $(todoList.querySelector('#status-select')).select2({
            placeholder: 'All',
        });
        this.selectPriority = $(todoList.querySelector('#priority-select')).select2({
            placeholder: 'All',
        });
        this.btnCreateTodo = todoList.querySelector('#create-todo-item');

        this.formEls = {
            title: document.querySelector('#input-title'),
            descr: document.querySelector('#input-descr'),
            select: document.querySelector('#form-select')
        }

        this.formEditEls = {
            title: document.querySelector('#input-title-edit'),
            descr: document.querySelector('#input-descr-edit'),
            select: document.querySelector('#form-select-edit')
        }

        this.cartDropDownBtn = []

        this.cartDropDown = []


        this.createCartBtn = document.querySelector('#form-save');

        this.cartBox = document.querySelector('.todo-items-box');

        this.open = false
        this.newCart = {};
        this.editCart = {};

        this.IsRenderItems = [];

        this.count = 0;

        this.titleSearchInput = document.querySelector('#title-search');

        this.openPopUp();
        this.createCart();
        this.searchTodos();
        this.filterByPriotity();
        this.getSavedToDo();
    }

    createCart() {
        this.createCartBtn.addEventListener('click', function (e) {
            this.newCart['title'] = this.formEls.title.value
            this.newCart['messedge'] = this.formEls.descr.value
            this.newCart['priority'] = this.formEls.select.options[this.formEls.select.selectedIndex].text
            localStorage.setItem( this.newCart.title, JSON.stringify(this.newCart))
            let itemCart = this.renderCartItem(this.newCart);
            this.addItemToBox(this.cartBox, itemCart, this.newCart.priority, this.count);
            this.count++
            $.magnificPopup.close()
            this.formEls.title.value = ''
            this.formEls.descr.value = ''
        }.bind(this))
    }


    renderCartItem(obj) {
        return `  
        <p class="title">${obj.title}</p>
        <p class="massedge">${obj.messedge}</p>
        <div class="bottom-content flex">
          <span class="priority">${obj.priority}</span>
          <div class="status-drop flex">
            <ul class="drop-down hide"> 
              <li data-item='done'>Done</li>
              <li data-item='edit'>Edit</li>
              <li data-item='del'>Delete</li>
            </ul>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div> 
`
    }

    addItemToBox(box, item, attr, count) {
        let itemBox = document.createElement('div');
        itemBox.classList.add('item-cart');
        itemBox.setAttribute('data-priotity', attr);
        itemBox.innerHTML = item
        this.cartDropDown.push(itemBox.querySelector('.drop-down'))
        itemBox.querySelector('.status-drop').addEventListener('click', function (e) {
            this.openDropDown(count, itemBox)
        }.bind(this))
        switch (attr.toLowerCase()) {
            case 'low': {
                itemBox.classList.add('low');
                break
            }

            case 'high': {
                itemBox.classList.add('high');
                break
            }
        }
        box.appendChild(itemBox)
    }



    openPopUp() {
        let self = this
        this.btnCreateTodo.addEventListener('click', function (e) {
            $.magnificPopup.open({
                items: {
                    src: '#pop-up-form'
                },
                callbacks: {
                    beforeOpen: function () {
                        // $(self.formEls.select).select2({

                        // })
                    }
                }
            })
        })
    }

    openDropDown(count, itemBox) {
        this.cartDropDown[count].classList.toggle('hide');
        this.changeStatus(itemBox)
    }

    changeStatus(itembox) {
        let dropDown = itembox.querySelector('.drop-down');
        let dropDownItems = dropDown.querySelectorAll('li');
        let dropItems = {}
        dropDownItems.forEach((el) => {
            let attr = el.getAttribute('data-item')
            switch (attr) {
                case 'done': {
                    dropItems['done'] = el
                    break
                }
                case 'edit': {
                    dropItems['edit'] = el
                    break
                }
                case 'del': {
                    dropItems['del'] = el
                    break
                }
            }
        })
        dropItems.done.addEventListener('click', function (e) {
            console.log(itembox)
            itembox.classList.toggle('green')
        })
        dropItems.del.addEventListener('click', function (e) {
            this.delFromLocalStorage(itembox)
            this.cartBox.removeChild(itembox)

        }.bind(this))

        dropItems.edit.addEventListener('click', function (e) {
         this.editItem(itembox)
        }.bind(this))
    }


    editItem(itembox) {
        let self = this
        console.log(itembox)
        let itemParams = {
            title: itembox.querySelector('.title'),
            messedge: itembox.querySelector('.massedge'),
            priority:  itembox.querySelector('.priority')
        }
        this.editCart['title'] = itembox.querySelector('.title').innerHTML
        this.editCart['messedge'] = itembox.querySelector('.massedge').innerHTML
        this.editCart['priority'] = itembox.querySelector('.priority').innerHTML
       
        $.magnificPopup.open({
            items: {
                src: '#pop-up-form-edit'
            },
            callbacks: {
                beforeOpen: function () {
                    self.formEditEls.title.value = self.editCart.title
                    self.formEditEls.descr.value = self.editCart['messedge']
                    let opts = [...document.querySelector('#pop-up-form-edit').querySelector('#form-select-edit').children]
                    console.log( self.editCart['priority'])
                    let selected = opts.find((el => el.value ==  self.editCart['priority'] ))
                    selected.selected = true
                }
            }
        })
        
        let btn = document.querySelector('#form-edit');
        btn.addEventListener('click', function(e) {
            itemParams.title.innerText =  self.formEditEls.title.value
            itemParams.messedge.innerText = self.formEditEls.descr.value
            $.magnificPopup.close()
        })
    }

 searchTodos() {
    let searchedTodos
    this.titleSearchInput.addEventListener('focus', (e)=>{
        searchedTodos = this.getTodos([...document.querySelectorAll('.item-cart')])
    })

    this.titleSearchInput.addEventListener('focusout', (e)=>{
        searchedTodos = []
    })

    this.titleSearchInput.addEventListener('input', (e)=>{
        if(this.titleSearchInput.value == ' ' || this.titleSearchInput.value == false ) {
            this.showAllTodos(searchedTodos)
        }
        if(searchedTodos.length > 0) {
            this.findTodos(searchedTodos, this.titleSearchInput.value.toLowerCase()) 
        }
    })

    this.titleSearchInput.addEventListener("keyup", (e)=>{
        if(e.keyCode === 8) {
            this.showTodos(searchedTodos, this.titleSearchInput.value.toLowerCase())
        }
    })
 }

 getTodos(arr) {
    let arrObjs = [];
    for(let i = 0; i < arr.length; i++) {
        let todoObj ={};
        todoObj['title'] = arr[i].querySelector('.title').innerText.toLowerCase();
        todoObj['el'] = arr[i]
        arrObjs.push(todoObj)
     }
     return arrObjs
 }

 findTodos(arr, val) {
    let s = arr.forEach((el)=> {
        if(!el.title.includes(val)) {
            el.el.classList.add('hide')
        }
    })
 }

 showTodos(arr, val) {
    let s = arr.forEach((el)=> {
        if(el.title.includes(val)) {
            el.el.classList.remove('hide')
        }
    })
 }

 showAllTodos(arr) {
    arr.forEach((el)=> {
        el.el.classList.remove('hide');
    })
 }

 filterByPriotity() {
    this.selectPriority.on('select2:select', (e) => {
        let items = this.getTodos([...document.querySelectorAll('.item-cart')])
        let selected = this.selectPriority.select2('data')[0].id
        console.log(selected)
        if(items.length < 1) return
        items.forEach((el) => {
            if(selected == 'all')  {
                el.el.classList.remove('hide')
                return
            }
            let attr = el.el.getAttribute('data-priotity');
            if( attr != selected ) {
                el.el.classList.add('hide')
            } else {
                el.el.classList.remove('hide')
            }
        })
    })

}


    getSavedToDo() {
        let savedArr = [];
        for(let i =0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            savedArr.push( JSON.parse( localStorage.getItem(key)))
        }
        if(savedArr.length > 0) {
            for(let i =0; i < savedArr.length; i++) {
                let itemCart = this.renderCartItem(savedArr[i]);
                this.addItemToBox(this.cartBox, itemCart, savedArr[i].priority, this.count);
                this.count++
            }
        } else {
            return
        }
    }

    delFromLocalStorage(itemBox) {
        let title = itemBox.querySelector('.title').innerText
        for(let i =0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if(key == title) {
                localStorage.removeItem(key)
            }
        }
    }
}

const todoList = new TodoList(document.querySelector('.todo-list-content'))
console.log(todoList)
