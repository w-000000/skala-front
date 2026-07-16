import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const commentForm =
    document.querySelector("#commentForm");

const commentContent =
    document.querySelector("#commentContent");

const commentButton =
    document.querySelector("#commentButton");

const commentMessage =
    document.querySelector("#commentMessage");

const commentList =
    document.querySelector("#commentList");

const commentCount =
    document.querySelector("#commentCount");

const characterCount =
    document.querySelector("#characterCount");

const loginGuide =
    document.querySelector("#loginGuide");

let currentUser = null;
let savedComments = [];

function showMessage(message, isError = false) {
    commentMessage.textContent = message;

    commentMessage.style.color = isError
        ? "#c0392b"
        : "#276749";
}

function setLoading(isLoading) {
    commentButton.disabled = isLoading;

    commentButton.textContent = isLoading
        ? "등록 중..."
        : "댓글 등록";
}

function getAuthorName(user) {
    if (!user || !user.email) {
        return "사용자";
    }

    return user.email.split("@")[0];
}

function formatDate(timestamp) {
    if (!timestamp) {
        return "방금 전";
    }

    const date = timestamp.toDate();

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function createActionButton(
    text,
    className,
    clickHandler
) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.className = className;

    button.addEventListener(
        "click",
        clickHandler
    );

    return button;
}

function startEditComment(
    article,
    commentId,
    comment
) {
    const contentElement =
        article.querySelector(
            ".comment-content"
        );

    const actionArea =
        article.querySelector(
            ".comment-actions"
        );

    if (
        article.querySelector(
            ".comment-edit-area"
        )
    ) {
        return;
    }

    contentElement.hidden = true;

    if (actionArea) {
        actionArea.hidden = true;
    }

    const editArea =
        document.createElement("div");

    editArea.className =
        "comment-edit-area";

    const textarea =
        document.createElement("textarea");

    textarea.className =
        "comment-edit-input";

    textarea.maxLength = 300;
    textarea.value =
        comment.content ?? "";

    const editCount =
        document.createElement("span");

    editCount.className =
        "comment-edit-count";

    editCount.textContent =
        `${textarea.value.length} / 300`;

    textarea.addEventListener(
        "input",
        () => {
            editCount.textContent =
                `${textarea.value.length} / 300`;
        }
    );

    const buttonArea =
        document.createElement("div");

    buttonArea.className =
        "comment-edit-buttons";

    const saveButton =
        createActionButton(
            "저장",
            "comment-save-button",
            async () => {
                const newContent =
                    textarea.value.trim();

                if (!newContent) {
                    alert(
                        "댓글 내용을 입력해 주세요."
                    );

                    textarea.focus();
                    return;
                }

                if (newContent.length > 300) {
                    alert(
                        "댓글은 300자 이하로 입력해 주세요."
                    );

                    return;
                }

                try {
                    saveButton.disabled = true;
                    saveButton.textContent =
                        "저장 중...";

                    await updateDoc(
                        doc(
                            db,
                            "comments",
                            commentId
                        ),
                        {
                            content:
                                newContent,

                            updatedAt:
                                serverTimestamp()
                        }
                    );
                } catch (error) {
                    console.error(
                        "댓글 수정 오류:",
                        error
                    );

                    alert(
                        "댓글 수정 중 오류가 발생했습니다."
                    );

                    saveButton.disabled = false;
                    saveButton.textContent =
                        "저장";
                }
            }
        );

    const cancelButton =
        createActionButton(
            "취소",
            "comment-cancel-button",
            () => {
                editArea.remove();

                contentElement.hidden =
                    false;

                if (actionArea) {
                    actionArea.hidden =
                        false;
                }
            }
        );

    buttonArea.append(
        saveButton,
        cancelButton
    );

    editArea.append(
        textarea,
        editCount,
        buttonArea
    );

    article.appendChild(editArea);

    textarea.focus();
}

async function removeComment(commentId) {
    const confirmed = confirm(
        "이 댓글을 삭제하시겠습니까?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteDoc(
            doc(
                db,
                "comments",
                commentId
            )
        );
    } catch (error) {
        console.error(
            "댓글 삭제 오류:",
            error
        );

        alert(
            "댓글 삭제 중 오류가 발생했습니다."
        );
    }
}

function createCommentElement(
    commentId,
    comment
) {
    const article =
        document.createElement("article");

    article.className =
        "comment-card";

    const header =
        document.createElement("div");

    header.className =
        "comment-card-header";

    /*
    작성자 이름과 수정·삭제 버튼을
    한 줄로 묶는 영역
    */
    const authorArea =
        document.createElement("div");

    authorArea.className =
        "comment-author-area";

    const author =
        document.createElement("strong");

    author.textContent =
        `👤 ${
            comment.authorName ?? "사용자"
        }`;

    authorArea.appendChild(author);

    const isOwner =
        currentUser &&
        currentUser.uid ===
            comment.authorId;

    /*
    본인이 작성한 댓글에만
    수정·삭제 버튼 표시
    */
    if (isOwner) {
        const actionArea =
            document.createElement("div");

        actionArea.className =
            "comment-actions";

        const editButton =
            createActionButton(
                "수정",
                "comment-edit-button",
                () => {
                    startEditComment(
                        article,
                        commentId,
                        comment
                    );
                }
            );

        const deleteButton =
            createActionButton(
                "삭제",
                "comment-delete-button",
                () => {
                    removeComment(
                        commentId
                    );
                }
            );

        actionArea.append(
            editButton,
            deleteButton
        );

        authorArea.appendChild(
            actionArea
        );
    }

    const dateArea =
        document.createElement("div");

    dateArea.className =
        "comment-date-area";

    const date =
        document.createElement("time");

    date.textContent =
        formatDate(comment.createdAt);

    dateArea.appendChild(date);

    if (comment.updatedAt) {
        const edited =
            document.createElement("span");

        edited.className =
            "comment-edited";

        edited.textContent = "수정됨";

        dateArea.appendChild(edited);
    }

    header.append(
        authorArea,
        dateArea
    );

    const content =
        document.createElement("p");

    content.className =
        "comment-content";

    content.textContent =
        comment.content ?? "";

    article.append(
        header,
        content
    );

    return article;
}

function renderComments() {
    commentList.innerHTML = "";

    commentCount.textContent =
        `${savedComments.length}개`;

    if (savedComments.length === 0) {
        const emptyMessage =
            document.createElement("p");

        emptyMessage.className =
            "comment-empty";

        emptyMessage.textContent =
            "아직 등록된 댓글이 없습니다.";

        commentList.appendChild(
            emptyMessage
        );

        return;
    }

    savedComments.forEach(
        ({ id, data }) => {
            const commentElement =
                createCommentElement(
                    id,
                    data
                );

            commentList.appendChild(
                commentElement
            );
        }
    );
}

/*
로그인 상태 확인
*/
onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
        loginGuide.hidden = true;
        commentForm.hidden = false;
    } else {
        loginGuide.hidden = false;
        commentForm.hidden = true;
    }

    renderComments();
});

/*
댓글 입력 글자 수
*/
commentContent.addEventListener(
    "input",
    () => {
        characterCount.textContent =
            `${
                commentContent.value.length
            } / 300`;
    }
);

/*
댓글 등록
*/
commentForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        commentMessage.textContent = "";

        if (!currentUser) {
            showMessage(
                "로그인한 사용자만 댓글을 작성할 수 있습니다.",
                true
            );

            return;
        }

        const content =
            commentContent.value.trim();

        if (!content) {
            showMessage(
                "댓글 내용을 입력해 주세요.",
                true
            );

            commentContent.focus();
            return;
        }

        if (content.length > 300) {
            showMessage(
                "댓글은 300자 이하로 입력해 주세요.",
                true
            );

            return;
        }

        setLoading(true);

        try {
            await addDoc(
                collection(
                    db,
                    "comments"
                ),
                {
                    content: content,

                    authorId:
                        currentUser.uid,

                    authorName:
                        getAuthorName(
                            currentUser
                        ),

                    createdAt:
                        serverTimestamp(),

                    updatedAt: null
                }
            );

            commentForm.reset();

            characterCount.textContent =
                "0 / 300";

            showMessage(
                "댓글이 등록되었습니다."
            );
        } catch (error) {
            console.error(
                "댓글 등록 오류:",
                error
            );

            if (
                error.code ===
                "permission-denied"
            ) {
                showMessage(
                    "로그인한 사용자만 댓글을 작성할 수 있습니다.",
                    true
                );

                return;
            }

            showMessage(
                "댓글 등록 중 오류가 발생했습니다.",
                true
            );
        } finally {
            setLoading(false);
        }
    }
);

/*
댓글 실시간 조회
*/
const commentsQuery = query(
    collection(db, "comments"),
    orderBy("createdAt", "desc")
);

onSnapshot(
    commentsQuery,
    (snapshot) => {
        savedComments =
            snapshot.docs.map(
                (documentSnapshot) => {
                    return {
                        id:
                            documentSnapshot.id,

                        data:
                            documentSnapshot.data()
                    };
                }
            );

        renderComments();
    },
    (error) => {
        console.error(
            "댓글 조회 오류:",
            error
        );

        commentList.innerHTML = "";

        const errorMessage =
            document.createElement("p");

        errorMessage.className =
            "comment-error";

        errorMessage.textContent =
            "댓글을 불러오지 못했습니다.";

        commentList.appendChild(
            errorMessage
        );
    }
);