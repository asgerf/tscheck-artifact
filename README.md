OOPSLA'14 Artifact Submission. 

The supplied VM contains the tool as it was when the paper was submitted.

For the newest version of the tool, see the [github page](https://github.com/asgerf/tscheck).

Using the VM
============

1. Start Oracle VirtualBox 4.3.12
2. Create a new virtual machine
    - configure it as a Linux, 32-bit Debian OS
    - use the supplied file as the hard drive
3. Start the VM
4. Log in as user `oopsla` with password `oopsla`.

Files in the Artifact
---------------------

All relevant files are in the `tscheck-artifact` folder and its subfolders:

    tscheck-artifact
      + benchmarks
      + evaluation
      + scripts
      + tscheck
      + output

`benchmarks`: the 10 JavaScript libaries and associated `.d.ts` files.

`evaluation`: our classification of warnings.

`scripts`: scripts for running `tscheck`; this folder in on the PATH.

`tscheck`: implementation of `tscheck`.

`output`: stores the output from the `run-benchmarks` script.

Usage
=====

The command `tscheck` is available on the PATH.

To check `foo.d.ts` against the library `foo.js`, run the command:

    tscheck foo.js foo.d.ts
    
Or simply:
    
    tscheck foo

To try this out on the `d3` benchmark, run:

    tscheck ~/tscheck-artifact/benchmarks/d3/d3

Output
------

tscheck prints a series of warnings, one warning per line, in no particular order.

The warnings have the format `foo.bar.baz: expected X but found Y`. This means the value one would get by evaluating the pseudo-expression `foo.bar.baz` was expected to have type `X`, but tscheck found something of type `Y` instead.

If there is no output, it means tscheck found no bugs in the `.d.ts` file.

Run Benchmarks
==============

The following command runs `tscheck` on all benchmarks (it takes a while to complete):

    run-benchmarks
    
The results are stored in the `output` folder.

(In the supplied VM, this script has already been run, but you may choose to run it again.)

Classification of Warnings
==========================

In the `evaluation` folder, there are text files for each benchmark containing the generated non-duplicate warnings annotated as follows:

    [HIGH]: the bug is high-impact (see definition in paper)
    [LOW]: geniuine but low-impact bug
    [FIXABLE]: the bug can be fixed
    [UNFIXABLE]: the bug cannot be fixed because of limitations in TypeScript
    [INIT]: spurious because of the initialization assumption (see paper)
    [PLATFORM]: spurious because of the platform assumption (see paper)
    [SPURIOUS]: spurious warning because of unsound analysis

Note that the *fixable* classifications were not discussed in the paper due to space restrictions.

The classification was done manually based on the library documentation, source code inspection, and experimentation. The classifications are thus not reproducable by a command, but you may wish to double-check some of our classifications.

The `evaluation/dups` folder contains warnings that have been classified as duplicates. For a warning to be considered a duplicate, it must be due to a genuine fixable bug and the duplicates must be likely to go away once the bug is fixed.

Analysis Time
-------------

The analysis time was measured using the `time` command.

    time tcheck --no-warn --stats FILE

The `no-warn` flag squelches ordinary output (but the analysis is still carried out), and the `stats` flag prints the number of function signatures checked.

The `time-benchmarks` command will run the above command on every benchmark and store the result in `output/time.txt`.

The `evaluation/timing` folder contains the times we measured for use in the paper.


Examples in the Paper
=====================

***Figure 1.***
Example is based on the following warning:

    d3.scale.theshold: expected {() => D3.Scale.ThresholdScale} but found nothing
    
Command to reproduce this specific warning:

    tscheck --path d3.scale ~/tscheck-artifact/benchmarks/d3/d3

(The `--path d3.scale` argument may be omitted but then more warnings will be generated).

***Figure 3.***
Example is based on the following warning:

    d3.layout.bundle()(D3.Layout.GraphLink[])[0].id: expected number but found nothing

Command to reproduce:

    tscheck --path d3.layout.bundle ~/tscheck-artifact/benchmarks/d3/d3

A short note on how to understand the generated warning:

Although a message such as `expected GraphNode[] but found GraphNode[][]` would be ideal in this scenario, the tool reports the first directly incompatibility it finds. In this case, it finds that `[0].id` does not exist on a two-dimensional array because the inner array does not have the `id` property which is required to satisfy the `GraphNode` interface.

