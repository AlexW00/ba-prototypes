export const onHasAlreadyCompletedExperiment = () => {
	// hide all children of body (class hidden)
	const body = document.body;
	for (let i = 0; i < body.children.length; i++) {
		const child = body.children[i];
		child.classList.toggle("hidden", true);
	}

	// show end message
	const endMessage = document.getElementById("end-message")!;
	endMessage.classList.toggle("hidden", false);
};
