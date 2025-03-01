document.addEventListener("DOMContentLoaded", function() {
    let ratingInput = document.getElementById("ratingInput");
    console.log("Ratings from server:", ratingInput);
             
    let stars = document.querySelectorAll(".ratings span");
            
            
    for(let star of stars){
    star.addEventListener("click", function(){
                  
        let children = star.parentElement.children;
            for(let child of children){
                if(child.getAttribute("data-clicked")){
                    return false;	
                     }
                  }
                  
        this.setAttribute("data-clicked", "true");
        let rating = this.dataset.rating;
        console.log("Updated Ratings Array:", rating);
                  
        ratingInput.value = rating;
                  
               });
            } 
})
                 
