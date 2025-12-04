document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const totalProgressCircle = document.querySelector(".total-progress");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const totalLabel = document.getElementById("total-label");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    // Allow Enter key to trigger search
    usernameInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            searchButton.click();
        }
    });

    function validateUsername(username) {
        if (username.trim() === "") {
            showError("Username cannot be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            showError("Invalid username format. Use only letters, numbers, hyphens, and underscores (1-15 characters)");
        }
        return isMatching;
    }

    function showError(message) {
        statsContainer.innerHTML = `<div class="error-message">${message}</div>`;
        statsContainer.classList.add("visible");
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.innerHTML = '<span class="loading"></span>Searching...';
            searchButton.disabled = true;
            statsContainer.classList.remove("visible");

            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql/";

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { username: `${username}` },
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            
            if (!response.ok) {
                throw new Error("Unable to fetch user details. Please check the username and try again.");
            }

            const parsedData = await response.json();
            
            if (!parsedData.data.matchedUser) {
                throw new Error("User not found. Please check the username.");
            }

            displayUserData(parsedData);
        } catch (error) {
            showError(error.message);
        } finally {
            searchButton.innerHTML = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalQues, totalQues, totalLabel, totalProgressCircle);
        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            {
                label: "Total Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions,
            },
            {
                label: "Easy Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions,
            },
            {
                label: "Medium Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions,
            },
            {
                label: "Hard Submissions",
                value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions,
            },
        ];

        cardStatsContainer.innerHTML = cardsData
            .map(
                (data) =>
                    `<div class="card">
                        <h4>${data.label}</h4>
                        <p>${data.value.toLocaleString()}</p>
                    </div>`
            )
            .join("");

        statsContainer.classList.add("visible");
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});

 