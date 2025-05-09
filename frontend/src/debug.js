// Add this script to your project to help identify what's causing the overflow
// You can include it temporarily in your index.html or main JS file

document.addEventListener("DOMContentLoaded", () => {
    // Function to find elements that might be causing horizontal overflow
    function findOverflowingElements() {
      const docWidth = document.documentElement.offsetWidth
      const elements = document.querySelectorAll("*")
  
      console.log("Checking for elements causing horizontal overflow...")
  
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i]
        const rect = el.getBoundingClientRect()
  
        if (rect.right > docWidth || rect.left < 0) {
          console.log("Overflowing element:", el)
          console.log("Element width:", rect.width)
          console.log("Element right edge:", rect.right)
          console.log("Document width:", docWidth)
          console.log("Element styles:", window.getComputedStyle(el))
          console.log("-------------------")
  
          // Highlight the overflowing element
          el.style.outline = "2px solid red"
        }
      }
    }
  
    // Run the check after a short delay to ensure all content is loaded
    setTimeout(findOverflowingElements, 1000)
  
    // Also run on window resize
    window.addEventListener("resize", () => {
      setTimeout(findOverflowingElements, 500)
    })
  })
  