/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alerts';

export const createTicket = async(summary,description,tags,urgency,panel,flags) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/createTicket',
            data: {
                summary,
                description,
                tags,
                urgency,
                panel,
                flags
            }
        })
        .then(() =>{
            location.reload();
        })
    } catch(err){
        console.log(err.message);
        showAlert('error','Ticket not created.')
    }
    
}

export const sendNewCard = async(el,id) => {
    if(el!=1){
        var newSection = el.parentElement.parentElement.childNodes[0].childNodes[0].textContent.replace(/\s/g, '').toLowerCase();
        try{
            const res = await axios({
                method: 'POST',
                url: 'http://127.0.0.1:3000/api/1/projects/updateCardPlace',
                data: {
                    id,
                    newSection
                }
            });
    
            if(res.data.status === 'Success'){
                showAlert('success','Successfully transferred.')
            }
        } catch(err){
            showAlert('error',err.message)
        }
    }
}

export const updateStatus = async(status) => {
    const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/1/users/updateStatus',
        data: {
            status
        }
    })
}

export const deleteMarker = async(text) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/deleteMarker',
            data: {
                text
            }
        }).then(() =>{
            location.reload();
        })
    } catch(err){
        showAlert('error',"You were unable to delete this marker.")
    }
}

export const changeRole = async(email, role) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/changeRole',
            data: {
                email,
                role
            }
        }).then(() =>{
            let col = {
                "Manager": 'rgb(245, 29, 137)',
                "Admin": 'rgb(209, 41, 41)',
                "Editor": 'rgb(44, 114, 206)'
            }
            const permissions = document.querySelectorAll('.perm-select');
            permissions.forEach(perm => {
                perm.parentElement.childNodes[0].style.backgroundColor = col[(perm.value.trim())];
            })
            location.reload();
        })
    } catch(err){
        showAlert('error',"User's role could not be changed.")
    }
}

export const switchProject = async(code) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/switchProject',
            data: {
                code
            }
        }).then(() =>{
            window.location = "/overview";
        })
    } catch(err){
        showAlert('error',"You were unable to switch projects.")
    }
}

export const leaveProject = async(code) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/leaveProject',
            data: {
                code
            }
        }).then(() =>{
            showAlert('success',`Successfully left the project.`)
            setTimeout(() => {
                location.reload();
            },500);
        })
    } catch(err){
        showAlert('error',"You were unable to leave this project.")
    }
}

export const updateCard = async(id,summary,description,urgency,tags,flags) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/updateCard',
            data: {
                id,
                summary,
                description,
                urgency,
                tags,
                flags
            }
        }).then(() => {
            location.reload();
        })
    } catch(err){
        showAlert('error',`There was an error updating this ticket.`)
    }
}

export const deleteCard = async(id) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/deleteCard',
            data: {
                id
            }
        }).then(() => {
            location.reload();
        })
    } catch(err){
        showAlert('error',`There was an error deleting this ticket.`)
    }
}

export const updateProject = async(name, type) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/updateProject',
            data: {
                name,
                type
            }
        }).then(() => {
            showAlert('success',`Successfully updated your project.`)
            setTimeout(() => {
                location.reload();
            },500);
        })
    } catch(err){
        showAlert('error',`There was an error updating your project.`)
    }
}

export const deleteProject = async() => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/deleteProject'
        }).then((res) => {
            showAlert('success',`Successfully deleted your project.`)
            setTimeout(() => {
                window.location = res.data.page;
            },500);
        })
    } catch(err){
        showAlert('error',err)
    }
}

export const createProject = async(name, type) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/createProject',
            data: {
                name,
                type
            }
        }).then(() => {
            showAlert('success',`Successfully created <b>${name}</b>.`)
            setTimeout(() => {
                window.location = "/overview";
            },500);
        })
    } catch(err){
        console.log(err.message)
        showAlert('error',`There was an error creating <b>${name}</b>.`)
    }
}

export const joinProject = async(code) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/joinProject',
            data: {
                code
            }
        }).then((res) => {
            showAlert('success',`Successfully joined <b>${res.data.project}</b>.`)
            setTimeout(() => {
                window.location = "/overview";
            },500);
        })
    } catch(err){
        console.log(err.message)
        showAlert('error',"You weren't able to join a project. Please contact the <b>project manager</b>.")
    }
}

export const removeUser = async(email) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/removeUser',
            data: {
                email
            }
        })
        .then(() =>{
            showAlert('success', 'User Removed from this Project.')
            setTimeout(() => {
                location.reload();
            }, 500)
        })
    } catch(err){
        console.log(err.message);
        showAlert('error','User could not be removed.')
    }
}

// export const banUser = async(email) => {
//     try{
//         const res = await axios({
//             method: 'POST',
//             url: 'http://127.0.0.1:3000/api/1/projects/banUser',
//             data: {
//                 email
//             }
//         })
//         .then(() =>{
//             showAlert('success', 'User Banned from this Project.')
//             setTimeout(() => {
//                 location.reload();
//             }, 500)
            
//         })
//     } catch(err){
//         console.log(err.message);
//         showAlert('error','User could not be banned.')
//     }
// }

export const updateProfile = async(name, email) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/updateProfile',
            data: {
                name,
                email
            }
        }).then(() =>{
            showAlert('success', 'Profile successfully updated.')
            setTimeout(() => {
                location.reload();
            }, 500)
        })
        
    } catch(err){
        showAlert('error','Profile could not be updated.')
    }
}

export const createMarker = async(text,colour) => {
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/projects/createMarker',
            data: {
                text,
                colour
            }
        }).then(() =>{
            location.reload();
        })
        
    } catch(err){
        showAlert('error','Marker could not be created.')
    }
}

export const register = async (name,email,password,cpassword) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/register',
            data: {
                name,
                email,
                password,
                cpassword
            }
        });

        if(res.data.status === 'Success'){
            showAlert('success','Successfully created your account.')
            window.location = "/action";
        }

    } catch(err) {
        if(err.response.data.message.name === 'MongoError'){
            showAlert('error',`This email is already in use.`);
        } else {
            showAlert('error',`Your passwords are not the same.`);
        }
        
    }
};

export const login = async (email, password) => {

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/1/users/login',
            data: {
                email,
                password
            }
        });

        if(res.data.status === 'Success'){
            showAlert('success','Successfully logged in.')
            window.location = "/overview";
        }

    } catch(err) {
        showAlert('error',`${err.response.data.message}.`);
    }
};

export const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/1/users/logout'
        }).then(() =>{
            showAlert('success', 'Successfully logged out.')
            window.setTimeout(() => { 
                location.assign('/login');
            }, 1000)
        })
    } catch(err){
        showAlert('error', 'Error logging out. Try again.')
    }
}

