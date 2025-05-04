const ProfileInitials = ({ name, size = 40, bgColor = "#00a3ad", textColor = "#ffffff" }) => {
    // Extract initials from name
    const getInitials = (name) => {
      if (!name) return "?"
  
      const names = name.split(" ")
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase()
      }
  
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }
  
    const initials = getInitials(name)
  
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: bgColor,
          color: textColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size / 2}px`,
          fontWeight: "bold",
        }}
      >
        {initials}
      </div>
    )
  }
  
  export default ProfileInitials
  