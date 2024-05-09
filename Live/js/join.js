let avatar


let lobbyForm = document.getElementById('lobby_form')
lobbyForm.addEventListener('submit', (e) => {
    e.preventDefault()

    if(!avatar){
        alert("Must select an avatar before joining room!")
        return
    }

    let urlParams = new URLSearchParams(window.location.search)
    let roomId = urlParams.get('room')

    sessionStorage.setItem('display_name', e.target.name.value)
    lobbyForm.reset()
    window.location = `room.html?room=${roomId}`
})

let avatarOption = document.getElementsByClassName('avatar_option')

for(let i=0; avatarOption.length > i; i++){

    avatarOption[i].addEventListener('click', (e) => {

        for(let i = 0; avatarOption.length > i; i++){
            avatarOption[i].classList.remove('avatar_option_selected')
        }
        
        avatarOption[i].classList.add('avatar_option_selected')
        avatar = e.target.src
        sessionStorage.setItem('avatar', avatar)
    })

   
}


// lobbyForm.room.addEventListener('keyup', (e) => {
//     let cleaned_value = e.target.value.replace(' ', ' ')
//     e.target.value = cleaned_value.toUpperCase()
// })