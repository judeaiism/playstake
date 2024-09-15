let workQueue: Array<() => void> = [/* tasks */];
let isProcessing = false;

function processQueue(deadline: IdleDeadline) {
  while (workQueue.length > 0 && deadline.timeRemaining() > 0) {
    const task = workQueue.shift();
    if (task) task();
  }
  
  if (workQueue.length > 0) {
    requestIdleCallback(processQueue);
  } else {
    isProcessing = false;
  }
}

function scheduleWork(task: () => void) {
  workQueue.push(task);
  if (!isProcessing) {
    isProcessing = true;
    requestIdleCallback(processQueue);
  }
}

// Usage
function animationFrame() {
  // Critical work here
  scheduleWork(() => {
    // Less critical work here
  });
  requestAnimationFrame(animationFrame);
}

requestAnimationFrame(animationFrame);
