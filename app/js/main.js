class TodoList {
    constructor(todoList) {
        this.selectStatus = $(todoList.querySelector('#status-select')).select2();
        this.selectPriority = $(todoList.querySelector('#priority-select')).select2();
        this.btnCreateTodo = todoList.querySelector('#create-todo-item');

        this.formEls = {
            title: document.querySelector('#input-descr'),
            descr: document.querySelector('#input-descr'),
            select: document.querySelector('#form-select')
        }

        this.openPopUp() 
    }

    openPopUp() {
        let self = this
        console.log(this.formEls)
        this.btnCreateTodo.addEventListener('click', function(e){
            $.magnificPopup.open({
                items: {
                  src: '#pop-up-form'
                },
                callbacks: {
                    beforeOpen: function() {
                        $(self.formEls.select).select2({

                        })
                    }
                }
            })
        })
    }

  }

  const todoList = new TodoList(document.querySelector('.todo-list-content'))
  console.log(todoList)