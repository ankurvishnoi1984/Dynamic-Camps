import DoctorManagement from "../DoctorManagement/Doctor"
import Navbar from "../navbar/navbar"

const DoctorPage = () => {
  return (
    <>
      <Navbar>
        <DoctorManagement/>
      </Navbar>
    </>
  )
}

export default DoctorPage