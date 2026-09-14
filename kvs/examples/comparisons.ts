type ReviewState = "queued" | "active" | "approved" | "rejected";
type Reviewer = "author" | "maintainer" | "guest";

function isFinished(state: ReviewState) {
    return state == "approved" | "rejected";
}

function isInPipeline(state: ReviewState) {
    return state == "queued" | "active" | "approved";
}

function needsAttention(state: ReviewState) {
    return state != "approved" | "rejected";
}

function canReview(reviewer: Reviewer, allowed: Reviewer[]?, priority: number) {
    return reviewer == ...allowed && 1 <= priority <= 3;
}

function allDecisionsAgree(first: ReviewState, second: ReviewState, third: ReviewState) {
    return first === second === third;
}

function isAssignedTo(actual: string?, requested: string) {
    return actual == requested;
}

// Comparing two nullable values directly is ambiguous. Test absence explicitly
// first; the successful branch then compares a present value with the other
// nullable value.
function sameAssignee(left: string?, right: string?) {
    if (left == null) return right == null;
    return left == right;
}

console.log(isFinished("approved")); // true
console.log(isFinished("active")); // false
console.log(isInPipeline("active")); // true
console.log(isInPipeline("rejected")); // false
console.log(needsAttention("active")); // true
console.log(needsAttention("approved")); // false
console.log(canReview("maintainer", ["author", "maintainer"], 2)); // true
console.log(canReview("maintainer", null, 2)); // false
console.log(canReview("guest", ["guest"], 5)); // false
console.log(allDecisionsAgree("approved", "approved", "approved")); // true
console.log(allDecisionsAgree("approved", "rejected", "approved")); // false
console.log(isAssignedTo("Ada", "Ada")); // true
console.log(isAssignedTo(null, "Ada")); // false
console.log(sameAssignee(null, null)); // true
console.log(sameAssignee(null, "Ada")); // false
console.log(sameAssignee("Ada", "Ada")); // true
console.log(sameAssignee("Ada", "Lin")); // false
