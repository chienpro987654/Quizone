function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

function isEmpty (str) {
    return (!str || str.length === 0);
}

function checkEmptyForm(content, answerA, answerB, answerC, answerD) {
    var check = !isEmpty(content) && !isEmpty(answerA) && !isEmpty(answerB)
        && !isEmpty(answerC) && !isEmpty(answerD);

    return check;
}

function makeSlug(name) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;

    result += name.replace(" ","-");
    result += "-";

    while (counter < 9) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function validateSheet(jsonData) {
    var name = 0;
    var des = 0;
    var ques = 0;
    for(var i=0;i<jsonData.length;i++){
        if (jsonData[i].A=="name" && (!isEmpty(jsonData[i].B))){
            name = 1;
        }

        if (jsonData[i].A=="description" && (!isEmpty(jsonData[i].B))){
            des = 1;
        }

        if (jsonData[i].A=="question" && (!isEmpty(jsonData[i].B))){
            ques++;
            if (jsonData[i+1].A!="answerA" || (isEmpty(jsonData[i+1].B))){
                ques--;
                continue;
            }
            if (jsonData[i+2].A!="answerB" || (isEmpty(jsonData[i+2].B))){
                ques--;
                continue;
            }
            if (jsonData[i+3].A!="answerC" || (isEmpty(jsonData[i+3].B))){
                ques--;
                continue;
            }
            if (jsonData[i+4].A!="answerD" || (isEmpty(jsonData[i+4].B))){
                ques--;
                continue;
            }

            if (jsonData[i+5].A!="answer" || (isEmpty(jsonData[i+5].B))){
                ques--;
                continue;
            }
            i=i+5;
        }
    }
    if (name && des && ques){
        return true;
    }
    return false;
}

module.exports = {isEmpty,checkEmptyForm,makeSlug,isNumber,validateSheet}