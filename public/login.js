$(document).ready(function(){
    $("#formNickname").validetta({
        bubblePosition: "bottom",
        bubbleGapTop: 10,
        bubbleGapLeft: 0,
        onError:function(e){
            e.preventDefault();
        }
    });
});