
//export const BASEURL = 'https://demo1.netcastservice.online'

const devUrl = 'https://demo2.netcastservice.online'
const localUrl = 'http://localhost:8035'
export const BASEURL = devUrl
export const BASEURL2 = devUrl
export const PageCount = 20;
export const ImageLimit = 10;
export const IMG_SIZE = 5; 

export const SelectStyle = {
    control: (provided, state) => ({
      ...provided,
    //   borderColor: "#1f8dd0", // Purple when focused, gray when not
      fontSize:"14px",
      color:"#2f2483",
      boxShadow: state.isFocused ? "0 0 0 1px #1f8dd0" : "none", // Focus glow
      "&:hover": {
        borderColor: "#1f8dd0", // Purple on hover
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#2f2483", // Change placeholder color
      fontWeight: "600",
    }),
    menu: (provided) => ({
      ...provided,
      maxHeight: 200, 
      overflowY: "auto",
      zIndex: 999999,
      background:"#fff", 
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 200, 
      color:"#2f2483",
    
    }),
  }