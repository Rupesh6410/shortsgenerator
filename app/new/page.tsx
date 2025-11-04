import react from 'react'
import { userCredits } from '@/lib/userCredits'
import  checkUser  from '@/lib/checkUser'
import CreateProject from './CreateProject'

const NewPage = async () => {
    const user = await checkUser()
    const credits = await userCredits()

    return <CreateProject user={user ?? null} credits={credits} />

}

export default NewPage