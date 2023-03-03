var typingTimer;
    var doneTypingInterval = 1000;
    const KAHOOT_SEARCH_BASE_URL = `https://api.quizit.online/kahoot/search`
    const kahootRooms = document.getElementsByClassName("kahoot-rooms")
    const loadState = document.getElementById("loader")
    loadState.style.display = "none"
    
    function doSomething() {
        const kahootSearchInput = document.getElementById("kahootSearchInput").value

        if(kahootSearchInput.value == null){
    loadState.style.display = "none"

        }

      fetch(`${KAHOOT_SEARCH_BASE_URL}?name=${kahootSearchInput}`, {
        headers:{
            "Content-Type":"application/json"
        }
      }).then((res) => res.json())
      .then(kahootData => {
        loadState.style.display = "block"

        while(kahootRooms[0].firstChild){
            kahootRooms[0].firstChild.remove()
        loadState.style.display = "none"

        }
        kahootData.data.map((elm, i) => {
            const br = document.createElement('br')

            const card = document.createElement("div")
            card.setAttribute("onclick", `window.location.href = '/kahoot/room/${elm.quizId}'`)
            card.setAttribute("class", "card")
            document.body.appendChild(card)
            const imageQuestionElm = document.createElement("img")
            imageQuestionElm.src = elm.image
            imageQuestionElm.setAttribute("id", "questionImage")

            const questionElm = document.createElement("p")
            questionElm.setAttribute("id", "question")
            questionElm.innerHTML = elm.title


            const answerElement = document.createElement("p")
            answerElement.setAttribute("id", "answer")
            answerElement.innerHTML = elm.description

            
            card.appendChild(imageQuestionElm)
            card.appendChild(br)
            card.appendChild(questionElm)
            card.appendChild(answerElement)
            kahootRooms[0].appendChild(card)
        })

      })
    }

    function onInput() {
        loadState.style.display = "block"
    
      clearTimeout(typingTimer);
      typingTimer = setTimeout(doSomething, doneTypingInterval);
    }

    